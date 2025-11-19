/**
 * Page Breadcrumbs
 *
 * Client component wrapper for Breadcrumbs to be used in Server Components
 */

"use client";

import { Breadcrumbs, BreadcrumbsProps } from "./breadcrumbs";

export function PageBreadcrumbs(props: BreadcrumbsProps) {
  return (
    <div className="hidden sm:block">
      <Breadcrumbs {...props} />
    </div>
  );
}
