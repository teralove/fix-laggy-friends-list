module.exports = function FixLaggyFriendsList(mod) {
    let requestTimeout,
        friendInfo;
        
    mod.hook('S_LOGIN', 'raw', event => {
        friendInfo = undefined;
    });
    
    mod.hook('C_UPDATE_FRIEND_INFO', 'raw', event => { 
        if (requestTimeout) {
            mod.send('S_UPDATE_FRIEND_INFO', 1,  {friends: []});
            return false;
        }
        requestTimeout = mod.setTimeout(()=>{
            requestTimeout = undefined;
        }, 200);
        
        if (friendInfo) mod.send('S_UPDATE_FRIEND_INFO', 1, friendInfo);
        friendInfo == undefined
    });

    mod.hook('S_UPDATE_FRIEND_INFO', 1, event => {
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
        
        return false;
    });
    
}