const router = require('express').Router();
const { User, Post, Comment } = require('../../models');

// new post
router.post('/', async (req, res) => {
  try {
    const newPost = await Post.create({
      title: req.body.title,
      post_body: req.body.post_body,
      user_id: req.session.user_id || req.body.user_id,
    });
    res.status(200).json(newPost);
  } catch (err) {
    res.status(400).json(err);
  }
});

// delete post
router.delete('/:id', async (req, res) => {
  try {
    const postData = await Post.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });
    if (!postData) {
      res.status(404).json({ message: "No post with that id!" });
      return;
    }
    res.status(200).json(postData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update post
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await Post.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!updatedPost[0]) {
      res.status(400).json({ message: "No post found with that id!" });
      return;
    }
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
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
          order: [['created_at', 'DESC']],
        },
      ],
    });

    // verify if POST belongs to user
    const myBlog = req.session.user_id === postData.user.id;
    const post = postData.get({ plain: true });
    post.myBlog = myBlog;

    // verify if COMMENT belongs to user
    const comments = postData.comments.map((comment) => {
      const myComment = req.session.user_id === comment.user.id;
      const c = comment.get({ plain: true });
      c.myComment = myComment;
      return c;
    });

    res.render('single-post', {
      post,
      comments,
      loggedIn: req.session.logged_in,
      userId: req.session.user_id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
