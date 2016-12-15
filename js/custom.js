var config = {
      apiKey: "AIzaSyAQCG_JCyMOVdPXWQe-djJf6tSnCZQk36c",
      authDomain: "driving-school-5eef5.firebaseapp.com",
      databaseURL: "https://driving-school-5eef5.firebaseio.com",
      storageBucket: "driving-school-5eef5.appspot.com",
      messagingSenderId: "771240715747"
    };
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function(currentUser) {
    if (currentUser) {
    	$(".username").html(currentUser.email);
    }
});

