import React, { useContext, useState } from 'react';
import { HashRouter as Router, Route, Link, Switch } from 'react-router-dom'
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import { ScaleLoader } from 'react-spinners'
import FundsManagement from './FundsManagement'
import ContractAdmin from './ContractAdmin'
import TransferGraph from './TransfersGraph'
import Dashboard from './Dashboard'
import Project from './projects/Project'
import BackProject from './projects/BackProject'
import CreateProject from './projects/CreateProject'
import { FundingContext } from '../context'

const drawerWidth = 240

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appBarBg: {
    backgroundColor: '#111735'
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  link: {
    textDecoration: 'none'
  },
  networkButton: {
    color: '#ffeb3b'
  }
})

function PersistentDrawerLeft({ classes, children, theme, loading }) {
  const [open, setOpen] = useState(false)
  const context = useContext(FundingContext)
  const { network, environment } = context
  const correctNetwork = network === environment

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={classNames(classes.appBar, classes.appBarBg, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar disableGutters={!open}>
          <IconButton
            color="inherit"
            aria-label="Open drawer"
            onClick={handleDrawerOpen}
            className={classNames(classes.menuButton, open && !loading && classes.hide)}
          >
            {loading
            ? <ScaleLoader
                sizeUnit={"px"}
                height={20}
                width={2}
                margin="3px"
                color={'#FFFFFF'}
            />
            : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" color="inherit" noWrap>
            Liquid Funding
          </Typography>
          <Button className={classes.networkButton}>
            {network && correctNetwork ? network : `Incorrect network`}
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          <Link to="/dashboard" className={classes.link}>
            <ListItem button>
              <ListItemIcon><InboxIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
          </Link>
        </List>
        <List>
          <Link to="/funds-management/" className={classes.link}>
            <ListItem button>
              <ListItemIcon><InboxIcon /></ListItemIcon>
              <ListItemText primary="Funds Management" />
            </ListItem>
          </Link>
        </List>
        <List>
          <Link to="/insights/" className={classes.link}>
            <ListItem button>
              <ListItemIcon><InboxIcon /></ListItemIcon>
              <ListItemText primary="Insights" />
            </ListItem>
          </Link>
        </List>
        <List>
          <Link to="/admin/" className={classes.link}>
            <ListItem button>
              <ListItemIcon><InboxIcon /></ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItem>
          </Link>
        </List>
        <Divider />
      </Drawer>
      <main
        className={classNames(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        <div className={classNames(classes.appBar)}>
          <Switch>
            <Route path="/(|dashboard)" component={Dashboard} />
            <Route path="/admin" component={ContractAdmin} />
            <Route path="/funds-management" render={() => <FundsManagement open={open} />} />
            <Route path="/insights" component={TransferGraph} />
            <Route path="/project/:id" component={Project} />
            <Route path="/create-project/" render={(props) => <CreateProject {...props} />} />
            <Route path="/back-project/:id" component={BackProject} />
          </Switch>
          {children}
        </div>
      </main>
    </div>
  );
}

PersistentDrawerLeft.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(PersistentDrawerLeft)
