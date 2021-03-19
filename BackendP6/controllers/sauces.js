
const Sauce = require('../models/sauce');

const fs = require('fs');



exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked:[],
    usersDisliked:[],
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};



exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    if (req.file){ Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      const filename = sauce.imageUrl.split("/image/")[1];fs.unlink("images/${filename}"),()=>{
         Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error })); 
      }
    }
  )} else {
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error })); 

  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = thing.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};





exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req,res,next) => {
  switch(req.body.like){
    case 1:
      Sauce.updateOne ({_id: req.params.id}, { $inc: {likes:1}, $push: {usersLiked: req.body.userId} })
        .then(() => {res.status(200).json({ message: 'Vous aimez cette sauce!'});})
        .catch((error) => {res.status(400).json({ error });});
    break;
    case -1:
      Sauce.updateOne ({_id: req.params.id}, { $inc:{dislikes: 1}, $push:{userDisliked : req.body.userId},_id: req.params.id,})
        .then(() => {res.status(200).json({ message: "Vous n'aimez pas cette sauce!"});})
        .catch((error) => {res.status(400).json({ error });});
    break;
    case 0:
      Sauce.findOne({ _id: req.params.id })
      .then ((sauce) => {
        if(sauce.usersLiked.find((user)=> user === req.body.userId)){
          Sauce.updateOne (
            {_id: req.params.id},
            {
              $inc:{likes: -1},
              $pull:{userLiked : req.body.userId},
              _id: req.params.id,
            }
          )
          .then(() => {
            res.status(200).json({ message: 'Vous avez supprimé votre like!'});
          })
          .catch((error) => {
            res.status(400).json({ error });
          });
        }
        if(sauce.usersDisliked.find((user) => user === req.body.userId)){
          Sauce.updateOne (
            {_id: req.params.id},
            {
              $inc:{dislikes: -1},
              $pull:{ userDisliked : req.body.userId},
              _id: req.params.id,
            }
          )
          .then(() => {
            res.status(200).json({ message: "Vous avez supprimé votre dislike!"});
          })
          .catch((error) => {
            res.status(400).json({ error });
          });
        }
      })
      .catch((error) => {res.status(404).json({ error: error});
    }); 
    break;
  }
}
