import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import '../cssFiles/adminHeader.css';
import { Outlet } from 'react-router-dom';
import { NavLink } from "react-router-dom";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    backgroundColor: '#d08a70',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  menuButton: {
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(110),
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  menuButtonShift: {
    marginLeft: drawerWidth,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  }
}));

const SideNav = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  const handleLogout = () => {
    window.location.href = '/';
  };
  return (
    <div className={classes.root}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          color="inherit"
          aria-label={open ? "close drawer" : "open drawer"}
          onClick={handleDrawerToggle}
          edge="start"
          className={`${classes.menuButton} ${open ? classes.menuButtonShift : ''}`}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.toolbar} />
        <ul>
          <ul><NavLink className='sideNavListItem' exact to="/viewproductsss">View Product</NavLink>    </ul>
          <ul><NavLink className='sideNavListItem' exact to="/addproducts">Add Product</NavLink>        </ul>
          <ul><NavLink className='sideNavListItem' exact to="/viewreview">View Reviews</NavLink>                  </ul>
          <ul><NavLink className='sideNavListItem' exact to="/viewanalysis">Analysis</NavLink                    ></ul>
          <ul><NavLink className='sideNavListItem' exact to="/addshipping">Add Shipping Method</NavLink></ul>
          <ul><NavLink className='sideNavListItem' exact to="/viewshipping">View Shipping Methods</NavLink></ul>
          <ul><NavLink className='sideNavListItem' exact to="/addcategory">Add Category</NavLink></ul>
          <ul><NavLink className='sideNavListItem' exact to="/viewcategory">View Categories</NavLink></ul>
          <ul onClick={handleLogout} className='sideNavListItem'>Logout</ul>
        </ul>
      </Drawer>
      <main className={classes.content}>
        <Outlet />
      </main>
    </div>
  );
};
export default SideNav;
