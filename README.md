# Prefix: .

# Commands:
Server argument can be sur / survival / 生存, anything else is skyblock

### winner <server> <winner name> <game name>
Send the winner message and set the winner in database
   **This command is sent by game chat bot too**

### draw <server> <game name>
Send the draw message and set placeholder in database

### list <survival / skyblock / all> <pageNumber>
list 10 winners. First argument must be survival/skyblock, if all then all, anything else will fuck up.
use page number to switch page, start from 0, default 0.
    
### players    
see all players name and uuid in the players table

### avatar <name>   
add player to the players table manually
    
### mgtmr <event emote> <event name> <skyblock start time> <survival start time>   
send tomorrow event message manaully, if start time is not provided, default to 21:00 and 22:00 respectively.
    
### mgtdy <event emote> <event name> <event time> <server>   
send event today message manually

----------------------------------------------------------------------------------------------------------------
  
All the event messages, event schedule, annoucement channel setting, role ping setting in ./editables
