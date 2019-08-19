import React from 'react';
import { Route, Link, Switch } from 'react-router-dom'
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ProjectIcon from '@material-ui/icons/Work';
import { ScaleLoader } from 'react-spinners'
import FundsManagement from './FundsManagement'
import ContractAdmin from './ContractAdmin'
import TransferGraph from './TransfersGraph'
import Dashboard from './Dashboard'
import Projects from './projects/Projects'
import Project from './projects/Project'
import FundProject from './projects/FundProject'
import BackProject from './projects/BackProject'
import ProjectPledges from './projects/ProjectPledges'
import CreateProject from './projects/CreateProject'
import CreateDelegate from './projects/CreateDelegate'

const drawerWidth = 240
const formatAccount = account => {
  const start = account.slice(0,6)
  const end = account.slice(-4)
  return `${start}...${end}`
}

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
    backgroundColor: '#fff'
  },
  accountText: {
    color: '#939BA1'
  },
  connect: {
    color: '#4360DF',
    fontSize: '15px',
    marginLeft: 'auto',
    marginRight: '3rem',
    cursor: 'pointer'
  },
  connected: {
    color: '#44D058',
    cursor: 'default'
  },
  connectedText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
    color: '#000000'
  },
  menuText: {
    color: '#000000'
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
  }
})

const MenuItem = ({to, name, className, icon}) => (
  <Link to={to} className={className}>
    <ListItem button>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={name}/>
    </ListItem>
  </Link>
)

class PersistentDrawerLeft extends React.Component {
  state = {
    open: false,
  };

  handleDrawerOpen = () => {
    this.setState({ open: true })
  };

  handleDrawerClose = () => {
    this.setState({ open: false })
  };

  render() {
    const { classes, theme, loading, account, enableEthereum } = this.props
    const { open } = this.state

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
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, open && !loading && classes.hide)}
            >
              {loading && <ScaleLoader
                sizeUnit={'px'}
                height={20}
                width={2}
                margin="3px"
                color={'#FFFFFF'}
              />}
              {!loading && <MenuIcon/>}
            </IconButton>
            <Typography className={classes.menuText} variant="h6" noWrap>
              Liquid Funding
            </Typography>
            <Typography className={classNames(classes.connect, {[classes.connected]: !!account})} onClick={!account ? enableEthereum : console.log}>
              {!!account && <div className={classes.connectedText}>
                <div className={classes.accountText}>{formatAccount(account)}</div>
                <div>Connected</div>
              </div>}
              {!account && <span>Connect</span>}
            </Typography>
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
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </div>
          <Divider/>
          <List>
            <MenuItem name="Dashboard" to="/dashboard" className={classes.link} icon={<InboxIcon/>}/>
            <MenuItem name="Funds Management" to="/funds-management" className={classes.link} icon={<InboxIcon/>}/>
            <MenuItem name="Insights" to="/insights/" className={classes.link} icon={<InboxIcon/>}/>
            <MenuItem name="Admin" to="/admin/" className={classes.link} icon={<InboxIcon/>}/>
          </List>
          <Divider/>
          <List>
            <MenuItem name="Create Project" to="/create-project" className={classes.link} icon={<AddIcon/>}/>
            <MenuItem name="Create Delegate" to="/create-delegate" className={classes.link} icon={<AddIcon/>}/>
            <MenuItem name="Projects" to="/projects" className={classes.link} icon={<ProjectIcon/>}/>
          </List>
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
              <Route path="/projects" component={Projects} />
              <Route path="/(profile|delegate|project)/:id" component={Project} />
              <Route path="/(fund-project)/:id" component={FundProject} />
              <Route path="/create-project/" render={(props) => <CreateProject {...props} />} />
              <Route path="/create-delegate/" render={(props) => <CreateDelegate {...props} />} />
              <Route path="/(back-delegate|back-project)/:id" component={BackProject} />
              <Route path="/project-pledges/:id" component={ProjectPledges} />
            </Switch>
            {this.props.children}
          </div>
        </main>
      </div>
    );
  }
}

PersistentDrawerLeft.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  account: PropTypes.string,
  enableEthereum: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(PersistentDrawerLeft)
