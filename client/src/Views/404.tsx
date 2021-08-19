import { makeStyles, Typography, useTheme } from "@material-ui/core";
import React from "react";
import Cube404 from "../assets/404.svg";
import { SecondaryButton } from "../Components/buttons";
import { ContentContainer } from "../Components/MainLayout";
import useTitle from "../hooks/useTitle";
import useWindowSize from "../hooks/useWindowSize";
import { Title } from "../styles/typography";
import { FlexColumn } from "../utils/components";
import { toWebPath } from "../utils/routes";

const breakpoint = 550;

const useStyles = ({ mobile }: { mobile: boolean }) =>
  makeStyles((theme) => ({
    wrapper: {
      display: "grid",
      gridTemplateColumns: mobile ? "" : "auto auto",
      gridTemplateRows: mobile ? "auto auto" : "",
      columnGap: theme.spacing(6),
      rowGap: theme.spacing(6),
      // margin: "auto", // vertical center
      marginTop: "30%",
      justifyItems: "center",
    },
    cube: {
      width: "250px",
    },
    rhs: {
      alignItems: mobile ? "center" : "flex-start",
      textAlign: mobile ? "center" : "left",
    },
    title: {
      marginBottom: theme.spacing(3),
    },
    para: {
      marginBottom: theme.spacing(2),
    },
  }));

export const NotFound = (): JSX.Element => {
  useTitle("Page Not Found");
  const { width } = useWindowSize();
  const w = width ?? 1000;
  const styles = useStyles({ mobile: w < breakpoint })(useTheme());
  return (
    <ContentContainer maxWidth="md">
      <div className={styles.wrapper}>
        <img src={Cube404} alt="404 Not Found" className={styles.cube} />
        <FlexColumn className={styles.rhs}>
          <Title className={styles.title}>Page Not Found</Title>
          <Typography className={styles.para}>
            Think this is an error? Submit a bug report using the{" "}
            <b>Feedback</b> tab.
          </Typography>
          <SecondaryButton component="a" href={toWebPath("")}>
            Back to home
          </SecondaryButton>
        </FlexColumn>
      </div>
    </ContentContainer>
  );
};
