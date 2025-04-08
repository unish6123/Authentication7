'use strict'

const $ = document.querySelector.bind(document);
let authenticationToken = " ";


// login link action
$('#loginLink').addEventListener('click',openLoginScreen);

// register link action
$('#registerLink').addEventListener('click',openRegisterScreen);

// logout link action
$('#logoutLink').addEventListener('click',openLoginScreen);

// Sign In button action
$('#loginBtn').addEventListener('click',()=>{
    // check to make sure username/password aren't blank
    if(!$('#loginUsername').value || !$('#loginPassword').value)
        return;

    const username = $("#loginUsername").value
    const password = $("#loginPassword").value
    console.log("The username is:", username, "and the passoword is ", password)

    fetch(`/users/auth`,{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ username: username,password:password})
    })
    .then(res=>res.json())
    .then(doc=>{
        if (doc.error){
            showError(doc.error);
        }
        else if (doc.match){
            authenticationToken = doc.authenticationToken;
            getUserInfo(authenticationToken);
            
        }
        else {
            showError('Username and password do not match.');
        }
    })
    .catch(err=>showError('ERROR: '+err));
        

});

// Register button action
$('#registerBtn').addEventListener('click',()=>{
    // check to make sure no fields aren't blank
    if(!$('#registerUsername').value ||
            !$('#registerPassword').value ||
            !$('#registerName').value ||
            !$('#registerEmail').value){
        showError('All fields are required.');
        return;
    }
    // grab all user info from input fields, and POST it to /users
    var data = {
        username: $('#registerUsername').value,
        password: $('#registerPassword').value,
        name: $('#registerName').value,
        email: $('#registerEmail').value
    };
    // TODO: 
    //   POST /users
    //     convert data (defined above) to json, and send via POST to /users
    //     decode response from json to object called doc
    //     if doc.error, showError(doc.error)
    //     otherwise, openHomeScreen(doc)
    //   use .catch(err=>showError('ERROR: '+err)}) to show any other errors
    if (!data.username || !data.password || !data.name || !data.email) {
        showError('All fields are required.');
        return;
    }

    fetch('/users/register',{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(doc=>{
        if (doc.error){
            showError(doc.error);
        }
        else {
            authenticationToken = doc.authToken;
            // console.log("The authentication token is :", authenticationToken)
            getUserInfo(authenticationToken);
            alert("You have successfully registered. Please log in to continue.");
        }
    })
});

// Update button action
$('#updateBtn').addEventListener('click',()=>{
    // check to make sure no fields aren't blank
    if(!$('#updateName').value || !$('#updateEmail').value){
        showError('Fields cannot be blank.');
        return;
    }
    const username = $('#username').innerText;
    // grab all user info from input fields
    var data = {
        name: $('#updateName').value,
        email: $('#updateEmail').value,
        token : authenticationToken,
        username:username
    };
    
    fetch(`/users/update`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(doc=>{
        if (doc.error){
            showError(doc.error);
        }
        else if (doc.ok){
            alert("Your name and email have been updated.");
        }
    })
});

// Delete button action
$('#deleteBtn').addEventListener('click',()=>{
    // confirm that the user wants to delete
    if(!confirm("Are you sure you want to delete your profile?"))
        return;
 
    const username = $('#username').innerText;
    console.log("The username is :", username)
    fetch(`/users/${username}/${authenticationToken}`,{
        method:'DELETE'
    })
    .then(res=>res.json())
    .then(doc=>{
        if (doc.error){
            showError(doc.message);
        }
        else {
            authenticationToken = "";
            openLoginScreen();
        }
    })
    .catch(err=>showError('ERROR: '+err));
});

function showListOfUsers(){
    // TODO:
    //   GET /users
    //     decode response from json to an array called docs
    //     for every doc in docs, call showUserInList(doc)
    //       you can do this by using a for-loop or, better yet, a forEach function:
    //         docs.forEach(showUserInList)
    //   use .catch(err=>showError('Could not get user list: '+err)}) to show any potential errors
    fetch('/users')
        .then(res => res.json())
        .then(docs => {
            docs.forEach(showUserInList);
        })
        .catch(err => showError('Could not get user list: ' + err));
}

async function getUserInfo(authenticationToken){
    

    fetch(`/userInfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({authToken: authenticationToken })
    })
        .then(res => {
            if (res.status === 401) {
                showError('You are not authorized to view this page.');
                return;
            }
            return res.json();
    })
        
        .then(doc => {
            if (doc.error) {
                showError(doc.error);
            } else {
                openHomeScreen(doc);
            }
        })
        .catch(err => showError('ERROR: ' + err));


}

function showUserInList(doc){
    // add doc.username to #userlist
    var item = document.createElement('li');
    $('#userlist').appendChild(item);
    item.innerText = doc.username;
}

function showError(err){
    // show error in dedicated error div
    $('#error').innerText=err;
}

function resetInputs(){
    // clear all input values
    var inputs = document.getElementsByTagName("input");
    for(var input of inputs){
        input.value='';
    }
}



function openHomeScreen(doc){
    // hide other screens, clear inputs, clear error
    $('#loginScreen').classList.add('hidden');
    $('#registerScreen').classList.add('hidden');
    resetInputs();
    showError('');
    // reveal home screen
    $('#homeScreen').classList.remove('hidden');
    // display name, username
    $('#name').innerText = doc.name;
    $('#username').innerText = doc.username;
    // display updatable user info in input fields
    $('#updateName').value = doc.name;
    $('#updateEmail').value = doc.email;
    // clear prior userlist
    $('#userlist').innerHTML = '';
    // show new list of users
    showListOfUsers();
}

function openLoginScreen(){
    // hide other screens, clear inputs, clear error
    $('#registerScreen').classList.add('hidden');
    $('#homeScreen').classList.add('hidden');
    resetInputs();
    showError('');
    authenticationToken = " ";
    // reveal login screen
    $('#loginScreen').classList.remove('hidden');
}

function openRegisterScreen(){
    // hide other screens, clear inputs, clear error
    $('#loginScreen').classList.add('hidden');
    $('#homeScreen').classList.add('hidden');
    resetInputs();
    showError('');
    // reveal register screen
    $('#registerScreen').classList.remove('hidden');
}

