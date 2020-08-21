module.exports = function FixLaggyFriendsList(mod) {
    let requestTimeout,
        friendInfo;
        
    mod.hook('S_LOGIN', 'raw', event => {
        friendInfo = undefined;
    });
    
    mod.hook('C_UPDATE_FRIEND_INFO', 'raw', event => {
        // prevent the client from sending multiple requests within a short time.
        if (requestTimeout) {
            mod.send('S_UPDATE_FRIEND_INFO', 1,  {friends: []});
            return false;
        }
        requestTimeout = mod.setTimeout(()=>{ requestTimeout = undefined; }, 200);
        // refresh the UI with the accumulated Update data.
        if (friendInfo) mod.send('S_UPDATE_FRIEND_INFO', 1, friendInfo);
        friendInfo = undefined;
    });

    mod.hook('S_UPDATE_FRIEND_INFO', 1, event => {
        // Store and grow the Update data until the client requests it.
        if (friendInfo == undefined) {
            friendInfo = event;
        } else {
            for (let newFriendInfo of event.friends) {
                let index = friendInfo.friends.findIndex(p=>p.id == newFriendInfo.id);
                if (index != -1) {
                   friendInfo.friends[index] = newFriendInfo;
                } else {
                    friendInfo.friends.push(newFriendInfo);
                }
            }
        }
        
        // The UI accumulates Updates in a queue and processes them when it is opened,
        //  which causes problems when the quantity of updates grows large over time.
        // This mod stores all the Updates into a single object to improve performance.
        return false;
    });
    
}