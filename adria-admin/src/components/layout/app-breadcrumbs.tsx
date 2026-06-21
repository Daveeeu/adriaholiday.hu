import { Link, useMatches } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { t } from '@/i18n';

type RouteHandle = {
  crumbKey?: string;
};

export function AppBreadcrumbs() {
  const matches = useMatches();

  const crumbs = matches
    .filter((match) => {
      const handle = match.handle as RouteHandle | undefined;
      return Boolean(handle?.crumbKey);
    })
    .map((match) => ({
      pathname: match.pathname,
      crumb: t((match.handle as RouteHandle).crumbKey as string),
    }));

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <div key={crumb.pathname} className="flex items-center gap-1.5">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.crumb}</BreadcrumbPage>
                ) : (
                  <Link
                    to={crumb.pathname}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.crumb}
                  </Link>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}