const router = require('express').Router();
const {check, validationResult} = require('express-validator');

//  models
const Film = require('../model/Film');

// middlewares
const auth = require('../middlewares/auth');




// @route   GET /api/film
// @desc    GET film list
// @access  Public
router.get('/', async(req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const startOffset = (page-1) * limit;   // slice(start, end) //// 1 -> (1-1) * 10 = 0 //// 2-> (2-1) * 10 = 10
  const endOffset = startOffset + limit;  // 10 -> 10 + 10 = 20;

  try {
    const films = await Film.find().sort({data: -1});
    const total = films.length;
    const result = {
      isSuccess: true,
      page,
      limit,
      total,
      data: films
    }
    if(total === 0) res.status(200).json(result);
    result.data = films.slice(startOffset, endOffset);

    res.status(200).json(result);
  } catch(err) {
    console.log('err herre', err);
    res.status(500).json({
      message: 'Sever Error',
      isSuccess: false
    })
  }
})


// @route   GET /api/film/:id
// @desc    GET single film
// @access  Public
router.get('/:id', auth, async(req, res) => {
  const id = req.params.id;
  try {
    const filmItem = await Film.findById(id);
    res.status(200).json({
      data: filmItem,
      isSuccess: true,
    })
  } catch(err) {
    res.status(500).json({
      message: 'Sever Error',
      isSuccess: false
    })
  }
})


// @route   POST /api/film
// @desc    GET film list
// @access  Private
router.post('/', 
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
// [auth,
//   check('title', 'Title is required').not().isEmpty(),
//   check('description', 'Description is required').not().isEmpty()
// ]
, async(req, res) => {
  // console.log('add new film', req.body);

  // validator fields
  const errors = validationResult(req);
  // console.log('errors: ', errors);
  if(!errors.isEmpty()) {
    return res.status(404).json({errors: errors.array()})
  }

  // creat new film
  const filmItem = new Film({
    title: req.body.title,
    banner: req.body.banner,
    description: req.body.description
  });

  try {
    const film = await filmItem.save();
    res.status(200).json({
      data: film,
      message: 'Add successfully',
      isSuccess : true,
    })
  } catch(err) {
    res.status(500).json({
      message: 'Sever Error',
      isSuccess: false
    })
  }
})

// @route PUT /api/film/:id
// @desc PUT film list
// @access Private

router.put('/:id', [auth, 
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], async(req, res) => {
  // console.log('update new film', req.params);

  // validator fields
  const errors = validationResult(req);
  // console.log('errors: ', errors);
  if(!errors.isEmpty()) {
    return res.status(404).json({errors: errors.array()})
  }

  const id = req.params.id;
  // update film
  const filmItem = {};
  if(req.body.quote) filmItem.quote = req.body.quote;
  if(req.body.banner) filmItem.banner = req.body.banner;

  filmItem.title = req.body.title;
  filmItem.description = req.body.description;
  filmItem.updatedDate = Date.now();

  // save data
  try {
    const film = await Film.findOneAndUpdate(
      {_id: id},
      {$set: filmItem},
      {new: true}
    );

    if(!film) {
      return res.status(400).json({
        data: null,
        message: `Can't update film`,
        isSuccess: false,
      })
    }
    res.status(200).json({
      message: `update film successfully`,
      isSuccess: true,
    })
  } catch(err) {
    res.status(500).json({
      message: 'Sever Error',
      isSuccess: false
    })
  }

  // console.log('update film: ', filmItem);
})

// @route DELETE /api/film/:id
// @desc DELETE film list
// @access Private

router.delete('/:id', auth, async(req, res) => {
  // console.log('delete film', req.params)
  const id = req.params.id;
  try {
    const filmItem = await Film.findOneAndRemove({_id: id});
    if(!filmItem) {
      return res.status(400).json({
        message: `Can't find item`,
        isSuccess: false,
      })
    }
    res.status(200).json({
      message: 'Delete successfully!',
      isSuccess: true,
    })
  } catch {
    res.status(500).json({
      message: 'Sever Error',
      isSuccess: false
    })
  }
})

module.exports = router