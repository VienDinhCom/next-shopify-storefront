import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Container from '@material-ui/core/Container';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ShoppingBasket from '@material-ui/icons/ShoppingBasket';
import MoreIcon from '@material-ui/icons/MoreVert';
import utilities from '../../utilities';
import { connect } from 'react-redux';
import { CheckoutState } from '../../store/checkout.slice';

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    display: 'block'
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200
    }
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  }
}));

interface Props {
  totalQuantity: number;
}

function PrimaryAppBar({ totalQuantity }: Props) {
  const theme = useTheme();
  const classes = useStyles(theme);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  function handleMobileMenuClose() {
    setMobileMoreAnchorEl(null);
  }

  function handleMobileMenuOpen(event) {
    setMobileMoreAnchorEl(event.currentTarget);
  }

  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={() => utilities.link({ path: '/' })}>Home</MenuItem>
      <MenuItem onClick={() => utilities.link({ path: '/products' })}>Products</MenuItem>
    </Menu>
  );

  return (
    <div className={classes.grow}>
      <AppBar position="fixed">
        <Container>
          <Toolbar disableGutters>
            <Typography className={classes.title} variant="h6" noWrap>
              Next Shopify Storefront
            </Typography>
            <div className={classes.grow} />
            <div className={classes.sectionDesktop}>
              <Button color="inherit" onClick={() => utilities.link({ path: '/' })}>
                Home
              </Button>
              <Button color="inherit" onClick={() => utilities.link({ path: '/products' })}>
                Products
              </Button>
              <IconButton color="inherit" onClick={() => utilities.link({ path: '/cart' })}>
                <Badge badgeContent={totalQuantity} color="secondary">
                  <ShoppingBasket />
                </Badge>
              </IconButton>
            </div>
            <div className={classes.sectionMobile}>
              <IconButton aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit">
                <MoreIcon />
              </IconButton>
              <IconButton color="inherit" onClick={() => utilities.link({ path: '/cart' })}>
                <Badge badgeContent={totalQuantity} color="secondary">
                  <ShoppingBasket />
                </Badge>
              </IconButton>
            </div>
          </Toolbar>
        </Container>
      </AppBar>
      {renderMobileMenu}
    </div>
  );
}

function mapStateToProps({ checkout }: { checkout: CheckoutState }) {
  let totalQuantity = 0;

  if (checkout.data) {
    totalQuantity = checkout.data.lineItems.edges.reduce((total, lineItem) => {
      return total + lineItem.node.quantity;
    }, 0);
  }

  return { totalQuantity };
}

export default connect(mapStateToProps)(PrimaryAppBar);
