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
    var waypointRef = database.child('Cities/Lodz/WayPoints/' + newWaypointId + "/photos");

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
    var chosenWaypoint = database.ref('Cities/Lodz/WayPoints/' + waypointId);
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
    var usersRef = firebase.database().ref("Users");
    var username;
    usersRef.orderByChild('uid').equalTo(userId).on("value", function (snapshot) {
        var data = snapshot.val();
        if(data != null) {
            username = data[Object.keys(data)[0]].name;
            callback(username)
        }
    })
}

<!--Is invoked when user clicks on waypoint(on map or in closest waypoints section) and is used to show all waypoints-->
function waypointClickHandler(waypointId) {
    findUser(function (user) {
        var counter = user.waypointsCounter;
        if(user.role == "nonSubscriber" && counter > 0) {
            var databaseRef = database.ref('Users').child(user.key);

            databaseRef.once('value', function(snapshot) {
                if( snapshot.val() != null ) {
                    var oldCounter = Number(snapshot.val().waypointsCounter);
                    $(".waypointDetails").remove();
                    snapshot.ref.update({"waypointsCounter": oldCounter - 1});
                    showWaypointInfoModal(waypointId);
                }
            });
        } else if(user.role == "nonSubscriber") {
            alert("You have no left waypoints to see. Subscription needed!");
        } else {
            showWaypointInfoModal(waypointId);
        }
    });
}

function showWaypointInfoModal(waypointId) {
    $(".slides").find("li").remove();
    $(".indicators").remove();
    $(".slider").slider();
    $(".slider").slider('pause');
    var chosenWaypoint = database.ref('Cities/Lodz/WayPoints/' + waypointId);
    chosenWaypoint.on('value', function(snapshot) {
        $(".comment").remove();
        var snapshotData = snapshot.val();
        snapshot.child("comments").forEach(function(childSnapshot) {
            var childSnapshotData = childSnapshot.val();
            findUsernameById(childSnapshotData.authorId, function (username) {
                appendComment(username,
                    (new Date(childSnapshotData.timestamp)).toLocaleString(),childSnapshotData.message);
            })

        })
        $("#waypointInfoModal").modal({
                ready: function (modal, trigger) {
                    modal.data("id", snapshotData.id);
                    $($(".waypointsDetails").remove());
                    $("#uploadFileBtn").off().on("click", function () {
                        $("#uploadFileInput").click();
                    });

                    $("#uploadFileInput").off().on("change input", function () {
                        addImages($("#waypointInfoModal").data("id"),$("#uploadFileInput")[0].files);
                    });
                },
                dismissible: false
            }
        );
        $("#waypointInfoModal").modal('open');

        $(".waypointInfo .title .value").html(snapshotData.address);
        $(".waypointInfo .description .value").html(snapshotData.description);
        getImagesFromStorage(snapshotData.id);
        if($(".slides").find("li").length == 0) {
            $(".slider").hide();
        } else {
            $(".slider").show();
        }
    })
}

<!--Adds new comment to waypoint-->
function addComment(authorId, message) {
    var seconds = + new Date();
    $(".comment").remove();
    var rootRef = firebase.database().ref();
    var waypointId = $("#waypointInfoModal").data("id");
    var commentsRef = rootRef.child('Cities/Lodz/WayPoints/' + waypointId + '/comments/');
    var newComment = commentsRef.push();
    newComment.set({
        authorId: authorId,
        message: message,
        timestamp: seconds
    });
    $(".slides").find("li").remove();
    $(".indicators").remove();
    getImagesFromStorage(waypointId);
}

<!--Append comment in comments section-->
function appendComment(authorId, date, message) {
    $(".comments").prepend("<div class='comment'><span class='commentAuthorId'>" + authorId + "</span><span class='commentDate'>" + date + "</span><span class='commentMessage'>" + message + "</span></div>")
}

<!--Closes waypoint info modal-->
function closeWaypointInfoModal() {
    $("#waypointInfoModal").modal('close');
    $(document).off("keyup");
    return false;
}

function findUser(callback) {
    var usersRef = firebase.database().ref("Users");
    var username;
    usersRef.orderByChild('email').equalTo($(".username").html()).once("value", function (snapshot) {
        var data = snapshot.val();
        if(data != null) {
            user = data[Object.keys(data)[0]];
            callback(user)
        }
    })
}

