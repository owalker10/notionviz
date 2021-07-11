import { styled } from "@material-ui/core";
import React from "react";

export const injectProps =
  <E extends React.ElementType>(
    myElement: E,
    myProps: React.ComponentProps<E> & Record<string, unknown>
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
