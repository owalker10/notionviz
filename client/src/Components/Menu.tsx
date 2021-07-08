/* eslint-disable react/jsx-props-no-spreading */
import React, { FC } from "react";
import { Menu, MenuProps } from "@material-ui/core";

interface CustomMenuProps {
  onClose: VoidFunction;
  anchorEl: HTMLElement | null;
  open?: boolean;
}

const CustomMenu: FC<
  React.PropsWithChildren<CustomMenuProps & Partial<MenuProps>>
> = ({ children, onClose, anchorEl, open, ...props }) => (
  <Menu
    open={open ?? Boolean(anchorEl)}
    onClose={onClose}
    anchorEl={anchorEl}
    {...props}
  >
    {children}
  </Menu>
);

export default CustomMenu;
