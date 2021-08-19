import { styled, Theme, withTheme } from "@material-ui/core";
import React from "react";

export const injectProps =
  <E extends React.ElementType>(
    myElement: E,
    myProps: Partial<React.ComponentProps<E>> & Record<string, unknown>
  ) =>
  (
    props: React.ComponentProps<E> & Record<string, unknown>
  ): React.ReactElement =>
    React.createElement(myElement, { ...myProps, ...props });

export const injectPropsToElement =
  <E extends React.ElementType>(
    myElement: React.ReactElement<E>,
    myProps: React.ComponentProps<E> & Record<string, unknown>
  ) =>
  (
    props: React.ComponentProps<E> & Record<string, unknown>
  ): React.ReactElement =>
    React.cloneElement(myElement, { ...myProps, ...props });

export const FlexColumn = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export const WrapGrid = withTheme(
  styled("div")(({ theme, colwidth }: { theme: Theme; colwidth: string }) => ({
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${colwidth}, max-content))`,
    gap: theme.spacing(3),
    flex: 1,
    justifyContent: "center",
  }))
);
