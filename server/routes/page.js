
exports.show =  function(req, res){
	console.log("Show page: ", req.params.id);

	// Add logic 

    res.render('page/index', {
        title: 'First page',
        user: req.user
    });
};
