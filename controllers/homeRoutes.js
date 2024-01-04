const router = require('express').Router();
const { User, Post, Comment } = require('../models');

// render home (main feed; public)
router.get('/', async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: { exclude: ['password'] },
        },
        {
          model: Comment,
          include: {
            model: User,
            attributes: ['id', 'username'],
          },
        },
      ],
      order: [['updated_at', 'DESC']],
    });
    res.render('home', {
      posts: postData.map((p) => p.get({ plain: true })),
      feed: true,
      loggedIn: req.session.logged_in,
      userId: req.session.user_id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// render dash (unique to user, shows only user's posts, only accessed when logged in)
router.get('/dash', async (req, res) => {
  try {
    if (req.session.logged_in) {
      const postData = await Post.findAll({
        where: {
          user_id: req.session.user_id,
        },
        include: [
          {
            model: User,
            attributes: { exclude: ['password'] },
          },
          {
            model: Comment,
            include: {
              model: User,
              attributes: ['id', 'username'],
            },
          },
        ],
        order: [['updated_at', 'DESC']],
      });

      const posts = postData.map((post) => post.get({ plain: true }));

      res.render('dash', {
        posts,
        loggedIn: req.session.logged_in,
        userId: req.session.user_id,
      });
      return;
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.log(err);
  }
});

// render login page if not logged in
router.get('/login', async (req, res) => {
  try {
    if (req.session.logged_in) {
      res.redirect('/');
      return;
    }
    res.render('login');
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// render new post page (if logged in)
router.get('/new', async (req, res) => {
  try {
    if (req.session.logged_in) {
      res.render('new', {
        loggedIn: req.session.logged_in,
        userId: req.session.user_id,
      });
      return;
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
