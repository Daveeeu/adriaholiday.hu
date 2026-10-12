Homepage Offers always use Media Library.

A Homepage Offer card links either to a category page (`/kategoriak/{slug}`, hidden while that category does not exist) or to another website (`https://…`, e.g. the partner site legjobbutak.hu), which opens in a new tab and is left out of the sitemap (`PortfolioCategoryLinks::isExternal`).

Apartment CRUD always uses Side Panel.

Every admin list returns

items
totalCount
page
perPage

Never use modal editing.

All CRUD pages refresh through React Query.

Portfolio is never imported into Admin.

Admin is never imported into Portfolio.

Media uploads always use MediaResource.

Select options always use SelectOptionController.

Mock data is forbidden.

API endpoints live only under /api/admin.