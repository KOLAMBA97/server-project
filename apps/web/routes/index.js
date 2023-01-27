const express = require('express');
const router = express.Router();
const {serversRouter} = require('./servers');
const {journalsRouter} = require('./journals');
const {tasksRouter} = require('./tasks');
const {chartsRouter} = require('./charts');

router.get('/', (req, res) => {
  res.render('index', {
    account: req.account,
    user: req.user,
    apps: req.relatedApplications,
  });
});

router.get('/partials/:path([\\w\\/-]+)', (req, res) => {
  res.render('partials/' + req.params.path, {
    account: req.account,
  });
});

router.use('/servers', serversRouter);
router.use('/journals', journalsRouter);
router.use('/tasks', tasksRouter);
router.use('/charts', chartsRouter);
module.exports = router;
