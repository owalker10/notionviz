import React, { FC } from "react";
import Skeleton from "@material-ui/lab/Skeleton";

export const SkeletonText: FC<
  React.PropsWithChildren<{ isLoading: boolean; width: string }>
> = ({ children, isLoading, width }) => (
  <>
    {isLoading ? (
      <Skeleton style={{ width }} variant="text" />
    ) : (
      children ?? null
    )}
  </>
);

// good for use with things like images
export const SkeletonWithContent: FC<{
  children: React.ReactElement;
  isLoading: boolean;
  className?: string;
  variant?: "text" | "rect" | "circle";
}> = ({ children, isLoading, className, variant }) =>
  isLoading ? (
    <Skeleton className={className} variant={variant ?? "rect"} />
  ) : (
    React.cloneElement(children, { className })
  );
