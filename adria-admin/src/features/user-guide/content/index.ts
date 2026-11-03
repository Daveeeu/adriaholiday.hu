import type { GuideChapter } from '../lib/user-guide.types';

import { administrationChapter } from './administration';
import { apartmentsChapter } from './apartments';
import { blogChapter } from './blog';
import { bookingsChapter } from './bookings';
import { dashboardChapter } from './dashboard';
import { gettingStartedChapter } from './getting-started';
import { mediaChapter } from './media';
import { publicSiteChapter } from './public-site';
import { settingsChapter } from './settings';
import { toursChapter } from './tours';
import { websiteContentChapter } from './website-content';

/** Chapters in the order of the admin's own menu. */
export const USER_GUIDE_CHAPTERS: GuideChapter[] = [
  gettingStartedChapter,
  dashboardChapter,
  toursChapter,
  apartmentsChapter,
  bookingsChapter,
  websiteContentChapter,
  blogChapter,
  mediaChapter,
  settingsChapter,
  administrationChapter,
  publicSiteChapter,
];
