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

<!--Adds images for waypoint-->
function addImages(newWaypointId, files) {
    var storage = firebase.storage();
    var database = firebase.database().ref();
    var waypointRef = database.child('Schemat/Content/Cities/Lodz/WayPoints/' + newWaypointId + "/photos");

    for (var i = 0; i < files.length; i++) {
        var newImage = waypointRef.push();
        var uploadTask = storage.ref("WayPoints/" + newWaypointId  + "/" + files[i].name).put(files[i]);
        uploadTask.on('state_changed', function(snapshot){
        }, function(error) {
            // Handle unsuccessful uploads
        }, function() {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            var downloadURL = uploadTask.snapshot.downloadURL;
            newImage.set({
//                        imagePath: files[i].name,
                authorId: firebase.auth().currentUser.uid,
                downloadUrl: downloadURL
            })
            if (window.location.href.indexOf("route.html") > -1) {
                $(".slides").find("li").remove();
                $(".indicators").remove();
                getImagesFromStorage(newWaypointId);
            }
        });

    }
}

<!--Gets images of waypoint from firebase storage-->
function getImagesFromStorage(waypointId) {
    var chosenWaypoint = database.ref('Schemat/Content/Cities/Lodz/WayPoints/' + waypointId);
    chosenWaypoint.on('value', function(snapshot) {
        snapshot.child("photos").forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            var slides = $(".slides");
            var img = $("<img />");
            img.attr("src", childData.downloadUrl);
            img.attr("style", "background-image: " + childData.downloadUrl);
            var li = $("<li />");
            li.append(img);
            slides.append(li);
        })
        $('.slider').slider({full_width: true});
        $('.slider').slider('pause');
        $('.indicator-item').on('click',function(){
            $('.slider').slider('pause');
        });
    })
}

function findUsernameById(userId, callback) {
    var usersRef = firebase.database().ref("Schemat/Content/Users");
    var username;
    usersRef.orderByChild('uid').equalTo(userId).on("value", function (snapshot) {
        var data = snapshot.val();
        if(data != null) {
            username = data[Object.keys(data)[0]].name;
            callback(username)
        }
    })
}


