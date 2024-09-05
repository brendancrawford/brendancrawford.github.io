window.onload = (event) => {


    // --- Variables ---

    let upload = document.getElementById('upload');
    let artistName = document.getElementById('artistName');
    let divResults = document.getElementById('results');
    let create = document.getElementById('create');
    let start = document.getElementById('start');
    let error = document.getElementById('error');
    let createAlbum = document.getElementById('createAlbum');
    let albumTitle = document.getElementById('albumTitle');
    let albums = document.getElementById('albums');
    let songTitle = document.getElementById('songTitle');
    let songRanking = document.getElementById('songRanking');
    let albumId = document.getElementById('albumId');
    let createSong = document.getElementById('createSong');
    let error2 = document.getElementById('error2');
    let btnResults = document.getElementById('btnResults');
    let topSongsTbl = document.getElementById('topSongsTbl');
    let topAlbumsTbl = document.getElementById('topAlbumsTbl');
    let artistScoreLbl = document.getElementById('artistScoreLbl');
    let artistScoreTitle = document.getElementById('artistScoreTitle');
    let subTitle = document.getElementById('subTitle');
    let btnExport = document.getElementById('btnExport');
    let success1 = document.getElementById('success1');
    let success2 = document.getElementById('success2');

    let fr = new FileReader();
    let newArtistName = "";
    let albumCount = -1;
    let songCount = 0;
    let detailCount = 0;
    let title = "";
    let rank = 0;

    // On Reload empty fields
    artistName.value = "";
    songTitle.value = "";
    albumId.value = "";
    albumTitle.value = "";
    songRanking.value = "";
    let lines = [];

    //                                    [ 0               1  ]            [ 0               1   ]
    let discography = []; // [Album Index][Album Title OR Songs][Song Index][Song Title OR Ranking]

    create.style.display = 'none';
    divResults.style.display = 'none';
    error.style.visibility = 'hidden';
    error2.style.visibility = 'hidden';
    upload.value = null;
    success1.style.visibility = 'hidden';
    success2.style.visibility = 'hidden';

    //  --- Upload, Read, and Write Rnkr Functions ---

    // Export current data
    function onExport() {

        let text = "";

        text += newArtistName + "\n";

        // for the artists discography entered so far
        for (let i = 0; i < discography.length; i++) {

            // add album title
            text += discography[i][0] + "\n";

            // for every song
            for (let x = 0; x < discography[i][1].length; x++) {

                // add song title
                text += discography[i][1][x][0] + "\n";
                // add song ranking
                text += discography[i][1][x][1] + "\n";

            }

            // Add empty string in array to show a new album
            text += "\n";

        }

        let data = new Blob([text], {type: 'text/plain'});
        let textFile = window.URL.createObjectURL(data);

        // make a link
        let link = document.createElement('a');
        link.setAttribute('download', newArtistName + ' Rnkr.txt');
        link.href = textFile;
        document.body.appendChild(link);

        // automatically download link without clicking on one
        window.requestAnimationFrame(function() {
            let event = new MouseEvent('click');
            link.dispatchEvent(event);
            document.body.removeChild(link);
        });

    }

    // Read imported file
    upload.addEventListener('change', ()=> {

        create.style.display = 'block'; //display create so user can see what they imported

        // Upload and split
        fr.readAsText(upload.files[0]);

        fr.onload = function(e) {
            const file = e.target.result;
            lines = file.split(/\r\n|\n/);

            // Read the data
            discography = []; // empty current discography if any

            // delete some unwanted elements in the lines array
            lines.pop();
            lines.pop();

            newArtistName = lines[0]; // set artist name which is first element in array

            // read every line
            for (let i = 0; i < lines.length; i++) {

                // if the previous index was empty the current one is the album title.
                // Or if it's the second index
                if (lines[i - 1] === "" || i === 1) {

                    // set album title
                    discography.push([lines[i], []]);
                    albumCount++; // setup for another new album
                    songCount = 0; // set for first song within the album
                    detailCount = 0;
                }

                else {

                    if (detailCount === 0) {

                        title = lines[i];

                        detailCount++; // next index will be the rank of the song

                    }

                    else {

                        rank = lines[i];

                        discography[albumCount][1].push([title, rank]);

                        detailCount = 0;
                        songCount++; // on to the next song within the album

                    }

                }

                refreshDiscography();

            }

        }

        upload.value = null;
        flashError(success1);


    });

    //  --- Create Rnkr Functions ---

    function flashError(element) {

        let count = 0;

        element.style.visibility = 'visible';
        let interval = setInterval(function() {
            element.style.fontWeight = (element.style.fontWeight == 'bold' ? '' : 'bold');
            count += 1;
            if(count === 5) {
                clearInterval(interval);
                element.style.visibility = 'hidden';
            }
        }, 600);

    }

    function onStart() {

        if (artistName.value == "") {

            flashError(error);

        }

        else {

            discography = [];
            refreshDiscography();

            newArtistName = artistName.value;
            artistName.value = "";
            create.style.display = 'block';
            createTitle.innerHTML = "Creating " + newArtistName + "'s Rnkr...";

        }

    }

    function addAlbum() {

        if (albumTitle.value == "") {
            flashError(error2);
        }

        else {

            discography.push([albumTitle.value, []]);
            refreshDiscography();
            flashError(success2);

        }

        albumTitle.value = "";

    }

    function addSong() {

        if (songTitle.value == "" || songRanking.value == "" || albumId.value == "" || songRanking.value < 0 || songRanking.value > 100) {
            flashError(error2);
        }

        else {

            try {
                // Add a song to the album at album ID
                discography[albumId.value - 1][1].push([songTitle.value, songRanking.value]);
                refreshDiscography();
                flashError(success2);
            } catch (e) {
                flashError(error2);
            }
            
        }

        songTitle.value = "";
        songRanking.value = "";
        albumId.value = "";

    }

    function refreshDiscography() {

        tempString = "";

        // For Each Album
        tempString = '<ol>';
        for (let i = 0; i < discography.length; i++) {
        
            tempString += "<li><span style='font-weight:bold'>" + discography[i][0] + "</span>";
                    
            // Don't look for songs if there aren't any.
            if (discography[i][1].length > 0) {

                // For Each Song
                tempString += '<ol>';
                for (let x = 0; x < discography[i][1].length; x++) {
                                    
                    tempString += "<li>&emsp;" + discography[i][1][x][0] + `&emsp;-&emsp;<span style='color: red;'>Score: </span>` + discography[i][1][x][1] + " / 100</li>";
                
                }
                tempString += '</ol>';

            }
        }
        tempString += '</li></ol>';

        albums.innerHTML = tempString;

    }

    function onGetResults() {

        divResults.style.display = 'block';

        let topSongs = getTopSongs();
        let topAlbums = getBestAlbums();
        let artistScore = getArtistScore();

        let tempTitle = "<h1>" + newArtistName + " Artist Score: </h1>";
        artistScoreTitle.innerHTML = tempTitle;

        artistScore = Math.round(artistScore);

        let tempScore = "<h2 style='font-size: 9vh;'>" + artistScore + "</h2>";
        artistScoreLbl.innerHTML = tempScore;

        scoreColour(artistScore);

        topSongsTbl.innerHTML = tableMaker(topSongs, newArtistName + " Songs Ranked");
        topAlbumsTbl.innerHTML = tableMaker(topAlbums, newArtistName + " Albums Ranked");

    }

    function scoreColour(score) {

        let tempLbl = "";

        console.log(score);
        score = parseInt(score);
        console.log(score);

        if (score < 10) {
            tempLbl = "<h3> Wow... you really don't like this artist :( </h3>";
            artistScoreLbl.style.color = "red";
        }

        if (score >= 10 && score < 20) {
            tempLbl = "<h3> Definitely not your favourite artist... </h3>";
            artistScoreLbl.style.color = "rgb(189, 52, 47)";
        }

        if (score >= 20 && score < 30) {
            tempLbl = "<h3> There are worse I guess? </h3>";
            artistScoreLbl.style.color = "orangered";
        }

        if (score >= 30 && score < 40) {
            tempLbl = "<h3> Maybe one or two okay songs... </h3>";
            artistScoreLbl.style.color = "orange";
        }

        if (score >= 40 && score < 50) {
            tempLbl = "<h3> At least they kinda tried </h3>";
            artistScoreLbl.style.color = "yellow";
        }

        if (score >= 50 && score < 60) {
            tempLbl = "<h3> Nothing wrong with average </h3>";
            artistScoreLbl.style.color = "rgb(216, 233, 27)";
        }

        if (score >= 60 && score < 70) {
            tempLbl = "<h3> Occasional banger... </h3>";
            artistScoreLbl.style.color = "yellowgreen";
        }

        if (score >= 70 && score < 80) {
            tempLbl = "<h3> Good overall artist </h3>";
            artistScoreLbl.style.color = "rgb(136, 226, 26)";
        }

        if (score >= 80 && score < 95) {
            tempLbl = "<h3> One of your favs maybe? :) </h3>";
            artistScoreLbl.style.color = "rgb(23, 215, 23)";
        }

        if (score >= 95 && score <= 100) {
            tempLbl = "<h3> Pretty much perfect! </h3>";
            artistScoreLbl.style.color = "green";
        }

        subTitle.innerHTML = tempLbl;

    }

    //  --- End Result Functions ---
    function tableMaker(array, tableTitle) {

        let rank = 1;
        let tempString = "<table>";
        tempString += "<tr>";
        tempString += "<th>Rank #</th>";
        tempString += "<th>" + tableTitle + "</th>";
        tempString += "<th>Score</th>";
        tempString += "</tr>";

        for (let i = 0; i < array.length; i++) {

            tempString += "<tr>";
            tempString += "<th>" + rank + "</th>";
            tempString += "<td>" + array[i][0] + "</td>";
            tempString += "<td>" + Math.round(array[i][1]) + "</td>";
            tempString += "</tr>";
            rank++;

        }

        tempString += "</table>";

        return tempString;

    }

    function getAlbumScores() {

        let results = [];

        // for every album
        for (let i = 0; i < discography.length; i++) {

            // reset for every album
            let score = 0;

            // for every song in album
            for (let x = 0; x < discography[i][1].length; x++) {

                // add every song ranking together
                score += parseInt(discography[i][1][x][1]);

            }

            // score divided by number of songs on the album
            score = score / discography[i][1].length;

            // overall album ranking pushed to results
            results.push([discography[i][0], score]);

        }

        return results;

    }

    function getAllSongs() {

        let results = [];

        // for every album
        for (let i = 0; i < discography.length; i++) {

            // for every song in album
            for (let x = 0; x < discography[i][1].length; x++) {

                // add the song rank with title to the results
                results.push(discography[i][1][x]);

            }

        }

        return results;
        
    }

    function getTopSongs() {
        
        let results = getAllSongs();

        // sort results by top rankings
        results.sort(function(a, b){return b[1]-a[1]});

        return results;
        
    }

    function getArtistScore() {

        let songs = getAllSongs();
        let numSongs = 0;
        let result = 0;

        // for every song
        for(let i = 0; i < songs.length; i++) {

            // add song score to result and increment numSongs
            result += parseInt(songs[i][1]);
            numSongs++;

        }

        // divide song ranks sum by number of songs
        result = result / numSongs;

        return result;

    }

    function getBestAlbums() {
        
        let results = getAlbumScores();

        // sort results by top rankings
        results.sort(function(a, b){return b[1]-a[1]});

        return results;

    }


    // --- Event Listeners ---
    btnResults.addEventListener('click', onGetResults);
    start.addEventListener('click', onStart);
    createAlbum.addEventListener('click', addAlbum);
    createSong.addEventListener('click', addSong);
    btnExport.addEventListener('click', onExport);
    

};



