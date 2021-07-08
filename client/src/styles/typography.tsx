/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-props-no-spreading */
import React, { FC } from "react";
import { makeStyles, Typography, useTheme } from "@material-ui/core";
import { Variant } from "@material-ui/core/styles/createTypography";

interface TypeProps {
  variant: Variant;
  component?: React.ElementType;
  className: "title";
}

interface HelperProps extends TypeProps {
  [p: string]: any;
}

const useStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.text.primary,
    fontWeight: 700,
  },
}));

const TypographyHelper: FC<React.PropsWithChildren<HelperProps>> = ({
  children,
  className,
  ...props
}) => {
  const styles = useStyles(useTheme());
  return (
    <Typography className={styles[className]} {...props}>
      {children}
    </Typography>
  );
};

const createTypography =
  (props: TypeProps) =>
  (anyProps: React.PropsWithChildren<Record<string, any>>) =>
    <TypographyHelper {...props} {...anyProps} />;

export const Title = createTypography({
  variant: "h3",
  className: "title",
  component: "h1",
});
