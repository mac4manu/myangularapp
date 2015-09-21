(function(){
 angular.module("LibraryApp",[])
 .controller("LibraryController",['$scope','$log','LibraryFactory', function($scope,$log,LibraryFactory){
	 $scope.books = [];
     $scope.isDataAvailable = false;
     $scope.moreInfo = false;
     $scope.filterName = "id";
	 $scope.filter= 1;
	 $scope.filterLabel = "Index";
     var filterResult = function(){
		$scope.books.sort(function(a,b){
			var target = b[$scope.filterName],
			    source = a[$scope.filterName];
			return (source > target ? 1 : -1);			 
		});
     } 
     $scope.showMore = function(){
  	   $scope.moreInfo = !$scope.moreInfo;
     };
	 $scope.setTab = function(value, label, key){
		 $scope.filter = value;
		 $scope.filterLabel = label;
		 $scope.filterName = key;
		 filterResult();
		 
	 };
	 $scope.getData = function(){
		 if(!$scope.q){
			 return false;
		 }
		 LibraryFactory.setSearchKey($scope.q);
		 LibraryFactory.getBooks().then(function(payload){
			 $scope.books = payload;
			 $scope.isDataAvailable = true;	
		 },function(errorPayload) {
              $log.error('failure loading movie', errorPayload);
          });
	 };
      
 }])
 .directive("searchBar",function(){
	 return {
		 restrict: 'E',
		 templateUrl: 'directives/SearchBar.html'
	 }
 })
 .directive("bookDetails",function(){
	 return {
		 restrict: 'E',
		 templateUrl: 'directives/BookDetails.html'
	 }
 })
 .factory("LibraryFactory",['$http', '$q', function($http, $q){
	 var bookService = {},
	     _api = 'https://www.googleapis.com/books/v1/volumes?q=',
		 _finalUrl = '',
		 _results = [],
		 _searchKey = '';
		 var createUrl = function(){
			 _finalUrl =  _api+_searchKey;
			 return _finalUrl;
		 }
		 bookService.setSearchKey = function(searchKey){
			 _searchKey = searchKey;
		 }
		 bookService.getSearchKey = function(){
			 return _searchKey;
		 }
		 bookService.getBooks = function(){
			 createUrl();
			 var deferred = $q.defer();
			 $http({
				 url: _finalUrl
			 }).success(function(data){
				 var res = [];
				 angular.forEach(data.items,function(value,index){
				 	res.push({
                     "id":index,
					 "title":value.volumeInfo.title,
					 "description":value.volumeInfo.description,
					 "authors":value.volumeInfo.authors.join(","),
					 "averageRating":value.volumeInfo.averageRating,
					 "thumbnail":value.volumeInfo.imageLinks.thumbnail,
					 "smallThumbnail":value.volumeInfo.imageLinks.smallThumbnail	
				 	});
				 });
				 deferred.resolve(res);
			 }).error(function(){
				 deferred.reject("There was an error");
			 })
			 return deferred.promise;
		 }
		 bookService.filterResults = function(books, needle, filterName){
	  		angular.forEach(books,function(value, index){
	 			if(filterName==='author'){
	 			   if(value.volumeInfo.authors.indexOf(needle)!==-1){
	 				   _results.push(value);
	  				}
	 			}else if(filterName==='title'){
	 	 			if(value.volumeInfo.title.match(new RegExp(needle,"i")) && value.volumeInfo.title.match(new RegExp(needle,"i")).index){
	 	 			   _results.push(value);
	 	 			}
	 			}
	  		});
	  		return _results;
		 }
		 return bookService;
 }])
})();