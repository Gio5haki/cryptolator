import React, { Component } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import CardContent from '@material-ui/core/CardContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';

import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { authMiddleWare } from '../util/auth';

const styles = (theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,

  textField: {
    marginBottom: theme.spacing(2),
  },

  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  submitButton: {
    display: 'block',
    color: 'white',
    textAlign: 'center',
    position: 'absolute',
    top: 14,
    right: 10,
  },
  floatingButton: {
    position: 'fixed',
    bottom: 0,
    right: 0,
  },
  form: {
    width: '98%',
    marginLeft: 13,
    marginTop: theme.spacing(10),
  },
  toolbar: theme.mixins.toolbar,
  root: {
    minWidth: 470,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  pos: {
    marginBottom: 12,
  },
  uiProgess: {
    position: 'fixed',
    zIndex: '1000',
    height: '31px',
    width: '31px',
    left: '50%',
    top: '35%',
  },
  dialogeStyle: {
    maxWidth: '50%',
  },
  viewRoot: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class Transaction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      transactions: '',
      label: '',
      date: '',
      usd: '',
      coin: '',
      discount: '',
      trader: '',
      customer: '',
      transactionId: '',
      totals: '',
      errors: [],
      open: false,
      uiLoading: true,
      buttonType: '',
      viewOpen: false,
    };

    this.deleteTransactionHandler = this.deleteTransactionHandler.bind(this);
    this.handleEditClickOpen = this.handleEditClickOpen.bind(this);
    this.handleViewOpen = this.handleViewOpen.bind(this);
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  componentWillMount = () => {
    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem('AuthToken');
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    axios
      .get('/transactions')
      .then((response) => {
        this.setState({
          transactions: response.data,
          uiLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get('/totals')
      .then((response) => {
        this.setState({
          totals: response.data,
          uiLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  deleteTransactionHandler(data) {
    authMiddleWare(this.props.history);
    const authToken = localStorage.getItem('AuthToken');
    axios.defaults.headers.common = { Authorization: `${authToken}` };
    let transactionId = data.transaction.transactionId;
    axios
      .delete(`transaction/${transactionId}`)
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleEditClickOpen(data) {
    this.setState({
      label: data.transaction.label,
      usd: data.transaction.usd,
      coin: data.transaction.coin,
      discount: data.transaction.discount,
      trader: data.transaction.trader,
      cutomer: data.transaction.customer,
      transactionId: data.transaction.transactionId,
      buttonType: 'Edit',
      open: true,
    });
  }

  handleViewOpen(data) {
    this.setState({
      label: data.transaction.label,
      date: data.transaction.date,
      usd: data.transaction.usd,
      coin: data.transaction.coin,
      discount: data.transaction.discount,
      trader: data.transaction.trader,
      customer: data.transaction.customer,
      viewOpen: true,
    });
  }

  render() {
    const DialogTitle = withStyles(styles)((props) => {
      const { children, classes, onClose, ...other } = props;
      return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
          <Typography variant="h6">{children}</Typography>
          {onClose ? (
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </MuiDialogTitle>
      );
    });

    const DialogContent = withStyles((theme) => ({
      viewRoot: {
        padding: theme.spacing(2),
      },
    }))(MuiDialogContent);

    dayjs.extend(relativeTime);
    const { classes } = this.props;
    const { open, errors, viewOpen } = this.state;

    const handleClickOpen = () => {
      this.setState({
        transactionId: '',
        label: '',
        coin: '',
        usd: '',
        discount: '',
        trader: '',
        customer: '',
        buttonType: '',
        open: true,
      });
    };

    const handleSubmit = (event) => {
      authMiddleWare(this.props.history);
      event.preventDefault();
      const userTransaction = {
        label: this.state.label,
        coin: this.state.coin,
        usd: this.state.usd,
        discount: this.state.discount,
        trader: this.state.trader,
        customer: this.state.customer,
      };
      let options = {};
      if (this.state.buttonType === 'Edit') {
        options = {
          url: `/transaction/${this.state.transactionId}`,
          method: 'put',
          data: userTransaction,
        };
      } else {
        options = {
          url: '/transaction',
          method: 'post',
          data: userTransaction,
        };
      }
      const authToken = localStorage.getItem('AuthToken');
      axios.defaults.headers.common = { Authorization: `${authToken}` };
      axios(options)
        .then(() => {
          this.setState({ open: false });
          window.location.reload();
        })
        .catch((error) => {
          this.setState({ open: true, errors: error.response.data });
          console.log(error);
        });
    };

    const handleViewClose = () => {
      this.setState({ viewOpen: false });
    };

    const handleClose = (event) => {
      this.setState({ open: false });
    };

    if (this.state.uiLoading === true) {
      return (
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {this.state.uiLoading && (
            <CircularProgress size={150} className={classes.uiProgess} />
          )}
        </main>
      );
    } else {
      return (
        <main className={classes.content}>
          <div className={classes.toolbar} />

          <IconButton
            className={classes.floatingButton}
            color="primary"
            aria-label="Add Transaction"
            onClick={handleClickOpen}
          >
            <AddCircleIcon style={{ fontSize: 60 }} />
          </IconButton>
         
          <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
          >
            <AppBar className={classes.appBar}>
              <Toolbar>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleClose}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                  {this.state.buttonType === 'Edit'
                    ? 'Edit Transaction'
                    : 'Create a new Transaction'}
                </Typography>
                <Button
                  autoFocus
                  color="inherit"
                  onClick={handleSubmit}
                  className={classes.submitButton}
                >
                  {this.state.buttonType === 'Edit' ? 'Save' : 'Submit'}
                </Button>
              </Toolbar>
            </AppBar>

            <form className={classes.form} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="transactionLabel"
                    label="Label"
                    name="label"
                    autoComplete="transactionLabel"
                    helperText={errors.label}
                    value={this.state.label}
                    error={errors.label ? true : false}
                    onChange={this.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="transactionUsd"
                    label="USD"
                    name="usd"
                    autoComplete="transactionUsd"
                    helperText={errors.usd}
                    value={this.state.usd}
                    error={errors.usd ? true : false}
                    onChange={this.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="transactionCoin"
                    label="Coin"
                    name="coin"
                    autoComplete="transactionCoin"
                    helperText={errors.coin}
                    value={this.state.coin}
                    error={errors.coin ? true : false}
                    onChange={this.handleChange}
                  />
                </Grid>

                {/*
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="transactionDiscount"
                    label="Discount"
                    name="discount"
                    autoComplete="transactionDiscount"
                    helperText={errors.discount}
                    value={this.state.discount}
                    error={errors.discount ? true : false}
                    onChange={this.handleChange}
                  />
                </Grid>
                */}

                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="transactionTrader"
                    label="Trader"
                    name="trader"
                    autoComplete="transactionTrader"
                    helperText={errors.trader}
                    value={this.state.trader}
                    error={errors.trader ? true : false}
                    onChange={this.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="transactionCustomer"
                    label="Customer"
                    name="customer"
                    autoComplete="transactionCustomer"
                    helperText={errors.customer}
                    value={this.state.customer}
                    error={errors.customer ? true : false}
                    onChange={this.handleChange}
                  />
                </Grid>
              </Grid>
            </form>
          </Dialog>

          <Grid container spacing={2}>
            {this.state.transactions.map((transaction) => (
              <Grid item xs={12} sm={6}>
                <Card className={classes.root} variant="outlined">
                  <CardContent>
                    <Typography variant="h5" component="h2">
                      {transaction.label}
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                      {dayjs(transaction.date).fromNow()}
                    </Typography>
                    <Typography variant="body2" component="p">
                      {`${transaction.coin.substring(0, 65)}`}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => this.handleViewOpen({ transaction })}
                    >
                      {' '}
                      View{' '}
                    </Button>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => this.handleEditClickOpen({ transaction })}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => this.deleteTodoHandler({ transaction })}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Dialog
            onClose={handleViewClose}
            aria-labelledby="customized-dialog-title"
            open={viewOpen}
            fullWidth
            classes={{ paperFullWidth: classes.dialogeStyle }}
          >
            <DialogTitle id="transactionLabel" onClose={handleViewClose}>
              {this.state.label}
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                fullWidth
                className={classes.textField}
                id="transactionUsd"
                label="USD"
                variant="outlined"
                name="USD"
                readonly
                value={this.state.usd}
                InputProps={{
                  disableUnderline: true,
                }}
              />
              <TextField
                fullWidth
                className={classes.textField}
                id="transactionCoin"
                label="Coin"
                variant="outlined"
                name="Coin"
                readonly
                value={this.state.coin}
                InputProps={{
                  disableUnderline: true,
                }}
              />
              <TextField
                fullWidth
                className={classes.textField}
                id="transactionDiscount"
                label="Discount"
                variant="outlined"
                name="Discount"
                readonly
                value={`${Math.round(this.state.discount)}%`}
                InputProps={{
                  disableUnderline: true,
                }}
              />
              <TextField
                fullWidth
                className={classes.textField}
                id="transactionTrader"
                name="Trader"
                label="Trader"
                variant="outlined"
                readonly
                value={this.state.trader}
                InputProps={{
                  disableUnderline: true,
                }}
              />
              <TextField
                fullWidth
                id="transactionCustomer"
                name="Customer"
                label="Customer"
                variant="outlined"
                readonly
                value={this.state.customer}
                InputProps={{
                  disableUnderline: true,
                }}
              />
            </DialogContent>
          </Dialog>
        </main>
      );
    }
  }
}

export default withStyles(styles)(Transaction);
