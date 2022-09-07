import psl = require('psl');
export default function getAttachmentDetails(url: string) {
    url = url.split("?").shift(); // remove query string parameters
    let hostname: string;

    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove "?"
    hostname = hostname.split('?')[0];
    hostname = psl.get(hostname);
    const hostingServices = { "discordapp.com": "Discord CDN", "youtube.com": "YouTube", "imgur.com": "Imgur", "gyazo.com": "Gyazo", "streamable.com": "Streamable", "youtu.be": "YouTube" };
    const friendlyHostname: string = hostingServices[hostname] === undefined ? hostname : hostingServices[hostname];

    // determine attachment type
    let friendlyFileType: string;
    switch (friendlyHostname) {
        case "Discord CDN": {
            if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg')) friendlyFileType = "Image";
            else if (url.endsWith('.gif')) friendlyFileType = "GIF";
            else if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.wmv') || url.endsWith('.webm')) friendlyFileType = "Video";
            break;
        }
        case "YouTube": {
            friendlyFileType = "Video";
            break;
        }
        case "Streamable": {
            friendlyFileType = "Video";
            break;
        }
        case "Gyazo": {
            friendlyFileType = "Gyazo Upload";
            break;
        }
        case "Imgur": {
            friendlyFileType = "Imgur Post";
            break;
        }
    }
    if (friendlyFileType === undefined) friendlyFileType = "Attachment";
    return { fileType: friendlyFileType, hostname: friendlyHostname };
}
