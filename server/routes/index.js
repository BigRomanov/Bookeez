
exports.home =  function(req, res){
    res.render('index', {
        title: 'bookeez',
        user: req.user
    });
};
