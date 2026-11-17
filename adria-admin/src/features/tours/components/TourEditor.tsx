import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
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
import {
  DEFAULT_OPEN_TOUR_FORM_SECTIONS,
  tourFormSectionsWithErrors,
} from '../lib/tour-form-sections';
import {
  TOURS_LIST_PATH,
  TOURS_QUERY_KEY,
  tourDetailQueryKey,
  tourEditPath,
} from '../lib/tour-routes';
import { createTour, deleteTour, updateTour } from '../lib/tours.api';
import {
  getTourFormDefaults,
  tourFormSchema,
  type Tour,
  type TourFormValues,
} from '../lib/tours.types';
import { TourEditorHeader } from './TourEditorHeader';
import { TourForm } from './TourForm';

const FORM_ID = 'tour-editor-form';

/** How many client-side messages the toast lists before it gets too long to read. */
const MAX_LISTED_ERRORS = 3;

type TourEditorProps = {
  /** The saved tour to edit; none: a new tour. */
  tour?: Tour;
};

/** The full-page tour editor: every section of the tour, saved together. */
export function TourEditor({ tour }: TourEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canDelete = useAuthStore((state) =>
    state.hasPermission('tours.delete'),
  );
  const [openSections, setOpenSections] = useState(
    DEFAULT_OPEN_TOUR_FORM_SECTIONS,
  );

  const form = useForm<TourFormValues>({
    defaultValues: getTourFormDefaults(tour),
    resolver: zodResolver(tourFormSchema) as Resolver<TourFormValues>,
  });

  const allowNavigation = useUnsavedChangesGuard(form.formState.isDirty);

  const revealErrors = () => {
    const sections = tourFormSectionsWithErrors(form.formState.errors);

    setOpenSections((current) => ({
      ...current,
      ...Object.fromEntries(sections.map((section) => [section, true])),
    }));
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
      setTourServerErrors(form, error);
      revealErrors();
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
      revealErrors();
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
          <TourForm
            form={form}
            tour={tour}
            openSections={openSections}
            onOpenSectionsChange={setOpenSections}
          />
        </form>
      </Form>
    </div>
  );
}
