import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  DEFAULT_TOUR_FORM_SECTION,
  isTourFormSection,
  type TourFormSectionKey,
} from './tour-form-sections';

const PARAM = 'szakasz';

/** The editor section the menu has open, kept in the address (?szakasz=) so a reload or a shared link opens it again. */
export function useTourEditorSection(): [
  TourFormSectionKey,
  (section: TourFormSectionKey) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(PARAM);
  const section = isTourFormSection(value) ? value : DEFAULT_TOUR_FORM_SECTION;

  const setSection = useCallback(
    (next: TourFormSectionKey) =>
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);

          if (next === DEFAULT_TOUR_FORM_SECTION) {
            params.delete(PARAM);
          } else {
            params.set(PARAM, next);
          }

          return params;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  return [section, setSection];
}
