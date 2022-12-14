const router = require('express').Router();
const { Project, User, Article, Favorite, Symbol } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', async (req, res) => {
  try {
    // Get all projects and JOIN with user data
    

    // Pass serialized data and session flag into template
    res.render('homepage', { 
      logged_in: req.session.logged_in 
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/project/:id', async (req, res) => {
  try {
    const projectData = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['name'],
        },
      ],
    });

    const project = projectData.get({ plain: true });

    res.render('project', {
      ...project,
      logged_in: req.session.logged_in
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get('/profile', withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Project }, {model: Symbol}],


    });

    const user = userData.get({ plain: true });
console.log(user)
    
    const articleData = await Article.findAll(
      { limit: 4 }
      // include: [{ model: Article }],
    );

    // Serialize data so the template can read it
    const articles = articleData.map((article) => article.get({ plain: true }));

    res.render('profile', {
      ...user,
      search: req.query.search,
      articles,
      logged_in: true
    });
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

router.get('/login', (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect('/profile');
    return;
  }

  res.render('login');
});

module.exports = router;
