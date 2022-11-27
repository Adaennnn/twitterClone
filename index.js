// Imported a module that allows us to fire off a function to create a uuid
import { v4 as uuidv4 } from 'https://jspm.dev/uuid'
import tweetsData from "./data.js"

const replyInput = document.getElementsByClassName("reply-input")
let parsedFeedFromLocalStorage = JSON.parse(localStorage.getItem("feed"))
// Is there any data stored in local storage ? If yes, set it to it, if not, set it to the tweetsData object
const localStorageOrNot = parsedFeedFromLocalStorage ? parsedFeedFromLocalStorage : tweetsData

document.addEventListener("click", function(e) {
    if (e.target.dataset.like) {
        handleLikeClick(e.target.dataset.like)
    } else if (e.target.dataset.retweet) {
        handleRetweetClick(e.target.dataset.retweet)
    } else if(e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply)
    } else if (e.target.id === "tweet-btn") {
        handleTweetBtnClick()
    } else if (e.target.dataset.replyBtn) {
        handleReplyBtnClick(e.target.dataset.replyBtn)
    } else if (e.target.dataset.deleteTweet) {
        handleDeleteTweetClick(e.target.dataset.deleteTweet)
    } else if (e.target.dataset.deleteReply && e.target.dataset.identifierReply) {
        handleDeleteReplyClick(e.target.dataset.deleteReply, e.target.dataset.identifierReply)
    }
})

function handleLikeClick(tweetId) {
    // We're storing to this variable only the tweet from tweetsdata that contains the uuid we're clicking on
    const targetTweetObj = localStorageOrNot.filter(function(tweet) {
            return tweet.uuid.includes(tweetId)
    })[0]
    if (targetTweetObj.isLiked) {
        targetTweetObj.likes--
    } else {
        targetTweetObj.likes++
    }
    // We're toggling the boolean isLiked on each click
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    render()
}

function handleRetweetClick(tweetId) {
    const targetTweetObj = localStorageOrNot.filter(function(tweet) {
        return tweet.uuid.includes(tweetId)
    })[0]
    if (targetTweetObj.isRetweeted) {
        targetTweetObj.retweets--
    } else {
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    render()
}

function handleReplyClick(replyId) {
    document.getElementById(`replies-${replyId}`).classList.toggle("hidden")
}

function handleTweetBtnClick() {
    const tweetInput = document.getElementById("tweet-input")
    // If the input field contains any value when submitted, add the data as a new tweet object at the beginning of the feed object
    if (tweetInput.value) {
        localStorageOrNot.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
        tweetInput.value = ""
        render()
    }
}

function handleReplyBtnClick(tweetId) {
    const targetTweetObj = localStorageOrNot.filter(function(tweet) {
        return tweet.uuid.includes(tweetId)
    })[0]
    // Converts an HTML collection to an array
    const replyInputArray = Array.from(replyInput)
    const targetReplyInput = replyInputArray.filter(function(input) {
        return input.dataset.replyInput == `${targetTweetObj.uuid}`
    })[0]
    if (targetReplyInput.value) {
        targetTweetObj.replies.push({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            tweetText: targetReplyInput.value,
            uuid: uuidv4()
        })
        targetReplyInput.value = ""
        render()
    }
}

function handleDeleteTweetClick(tweetId) {
    const targetTweetObj = localStorageOrNot.filter(function(tweet) {
        return tweet.uuid.includes(tweetId)
    })[0]
    // Let's remove targetTweetObj from the feed object when the function is fired
    localStorageOrNot.splice(targetTweetObj, 1)
    render()
}

function handleDeleteReplyClick(tweetId, replyId) {
    const targetTweetObj = localStorageOrNot.filter(function(tweet) {
        return tweet.uuid.includes(tweetId)
    })[0]
    const targetReplyObj = targetTweetObj.replies.filter(function(reply) {
        return reply.uuid === replyId
    })[0]
    if (targetTweetObj.replies.includes(targetReplyObj)) {
        const index = targetTweetObj.replies.indexOf(targetReplyObj)
        if (index > -1) {
            targetTweetObj.replies.splice(index, 1)
        }
    }
    render()
}

function getFeedHtml() {
    let feedHtml = ""
    localStorageOrNot.forEach(tweet => {
        // For each tweet, check if it's liked or retweeted, if it is, set the variables to the proper classes, or else, set the variables to empty strings
        let likeIconClass = tweet.isLiked ? "liked" : ""
        let retweetIconClass = tweet.isRetweeted ? "retweeted" : ""
        // We check if the tweet handle equals to the Scrimba user, if it is, attach the current tweet uuid to the data set so that we can use it as a reference to delete if needed later on
        let myTweetOrNot = tweet.handle === "@Scrimba" ? `<i class="fa-solid fa-xmark tweet-mark" data-delete-tweet="${tweet.uuid}"></i>` : ""
        let repliesHtml = ''
        if (tweet.replies.length > 0) {
            // replies is an array inside tweet, so we iterate it with a forEach
            tweet.replies.forEach(reply => {
                let myReplyOrNot = reply.handle === "@Scrimba" ? `<i class="fa-solid fa-xmark reply-mark" data-delete-reply="${tweet.uuid}" data-identifier-reply="${reply.uuid}"></i>` : ""
                repliesHtml += `
                            <div class="tweet-reply">
                <div class="tweet-inner">
                    <img src="${reply.profilePic}" class="profile-pic">
                        <div>
                            <p class="handle">${reply.handle}</p>
                            <p class="tweet-text">${reply.tweetText}</p>
                        </div>
                        ${myReplyOrNot}
                    </div>
            </div>
                `
            })
        }
        // On each iteration, add the new data to feedHtml, anything new will update in feedHtml
        feedHtml += `
        <div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                <i class="fa-regular fa-comment-dots" data-reply="${tweet.uuid}"></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}" data-like="${tweet.uuid}"></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}" data-retweet="${tweet.uuid}"></i>
                    ${tweet.retweets}
                </span>
            </div>   
            ${myTweetOrNot}
        </div>            
    </div>
    <div id="replies-${tweet.uuid}">
        ${repliesHtml}
        <div class="user-reply">
        <img src="images/scrimbalogo.png" class="profile-pic">
        <textarea placeholder="Say what's on your mind" class="reply-input" data-reply-input="${tweet.uuid}"></textarea>
        <button class="reply-btn" data-reply-btn="${tweet.uuid}">Reply</button>
        </div>
    </div> 
</div>
        `
    })
    return feedHtml
}

function render() {
    localStorage.setItem("feed", JSON.stringify(localStorageOrNot))
    document.getElementById("feed").innerHTML = getFeedHtml()
}
render()