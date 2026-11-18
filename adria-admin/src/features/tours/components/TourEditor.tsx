import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Form } from '@/components/ui/form';
import { getValidationSummary } from '@/lib/api-errors';
import { useUnsavedChangesGuard } from '@/lib/use-unsaved-changes-guard';
import { useAuthStore } from '@/store/auth-store';

import {
  collectFormErrorMessages,
  setTourServerErrors,
} from '../lib/tour-form-errors';
import { tourFormSectionsWithErrors } from '../lib/tour-form-sections';
import {
  TOURS_LIST_PATH,
  TOURS_QUERY_KEY,
  tourDetailQueryKey,
  tourEditPath,
} from '../lib/tour-routes';
import { createTour, deleteTour, updateTour } from '../lib/tours.api';
import { useTourEditorSection } from '../lib/use-tour-editor-section';
import {
  getTourFormDefaults,
  tourFormSchema,
  type Tour,
  type TourFormValues,
} from '../lib/tours.types';
import { TourEditorHeader } from './TourEditorHeader';
import { TourEditorBody } from './TourEditorBody';

const FORM_ID = 'tour-editor-form';

/** How many client-side messages the toast lists before it gets too long to read. */
const MAX_LISTED_ERRORS = 3;

type TourEditorProps = {
  /** The saved tour to edit; none: a new tour. */
  tour?: Tour;
  /** What a new tour starts with (e.g. its default category). */
  initialValues?: Partial<Tour>;
};

/** The full-page tour editor: every section of the tour, saved together. */
export function TourEditor({ tour, initialValues }: TourEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canDelete = useAuthStore((state) =>
    state.hasPermission('tours.delete'),
  );
  const [section, setSection] = useTourEditorSection();

  const form = useForm<TourFormValues>({
    defaultValues: getTourFormDefaults(tour ?? initialValues),
    resolver: zodResolver(tourFormSchema) as Resolver<TourFormValues>,
  });

  const allowNavigation = useUnsavedChangesGuard(form.formState.isDirty);

  // Opens the first section with an error, unless the open one has one.
  const revealErrors = (errors: FieldErrors<TourFormValues> | string[]) => {
    const sections = tourFormSectionsWithErrors(errors);

    if (sections.length > 0 && !sections.includes(section)) {
      setSection(sections[0]);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (values: TourFormValues) =>
      tour ? updateTour(tour.id, values) : createTour(values),
    onSuccess: (saved) => {
      // The lists refresh when next shown; the saved tour is already the editor's.
      queryClient.invalidateQueries({
        queryKey: TOURS_QUERY_KEY,
        refetchType: 'none',
      });
      queryClient.setQueryData(tourDetailQueryKey(saved.id), saved);

      if (tour) {
        form.reset(getTourFormDefaults(saved));
        toast.success('Körutazás mentve.');

        return;
      }

      toast.success('Körutazás létrehozva.');
      allowNavigation();
      navigate(tourEditPath(saved.id), { replace: true });
    },
    onError: (error) => {
      revealErrors(setTourServerErrors(form, error));
      toast.error(
        tour
          ? 'Nem sikerült menteni a körutazást.'
          : 'Nem sikerült létrehozni a körutazást.',
        {
          description: getValidationSummary(error),
        },
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTour,
    onSuccess: (_, tourId) => {
      queryClient.removeQueries({ queryKey: tourDetailQueryKey(tourId) });
      queryClient.invalidateQueries({
        queryKey: TOURS_QUERY_KEY,
        refetchType: 'none',
      });
      toast.success('Körutazás törölve.');
      allowNavigation();
      navigate(TOURS_LIST_PATH);
    },
    onError: () => toast.error('Nem sikerült törölni a körutazást.'),
  });

  const busy = saveMutation.isPending || deleteMutation.isPending;

  const handleSubmit = form.handleSubmit(
    (values) => saveMutation.mutate(values),
    (errors) => {
      revealErrors(errors);
      const messages = collectFormErrorMessages(errors);
      const rest = messages.length - MAX_LISTED_ERRORS;

      toast.error('Néhány mező hibás, javítsd őket a mentés előtt.', {
        description: [
          ...messages.slice(0, MAX_LISTED_ERRORS),
          ...(rest > 0 ? [`(És még ${rest} hiba.)`] : []),
        ].join(' '),
      });
    },
  );

  const handleDelete =
    tour && canDelete
      ? () => {
          if (
            window.confirm(`Biztosan törlöd ezt a körutazást? (${tour.name})`)
          ) {
            deleteMutation.mutate(tour.id);
          }
        }
      : undefined;

  return (
    <div className="space-y-5">
      <TourEditorHeader
        tour={tour}
        formId={FORM_ID}
        dirty={form.formState.isDirty}
        saving={saveMutation.isPending}
        busy={busy}
        onDelete={handleDelete}
      />

      <Form {...form}>
        <form id={FORM_ID} noValidate onSubmit={handleSubmit}>
          <TourEditorBody
            form={form}
            tour={tour ?? initialValues}
            section={section}
            onSectionChange={setSection}
          />
        </form>
      </Form>
    </div>
  );
}
