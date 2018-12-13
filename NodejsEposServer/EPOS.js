//https://redislabs.com/node-js-memcached
//https://www.npmjs.com/package/memjs
	




	
function DataOfObjectAsText(ObjectReference, Level, MaxLevel, ShowContentOfFunctions)
 {
  if (Level >= MaxLevel)
   {
    return '';
   }
   
  var ObjectDataAsText = '';
  var ValueOfProperty;
  var TextPrefix = '';
  for (var i = 0; i < Level; i++)
   {
    TextPrefix = TextPrefix + '   ';
   }

  var DataOfProperty;
  for (var NameOfProperty in ObjectReference)
   {
    ValueOfProperty = ObjectReference[NameOfProperty];
    if (typeof(ValueOfProperty) == 'object')
     {
      ValueOfProperty = DataOfObjectAsText(ValueOfProperty, Level + 1, MaxLevel, ShowContentOfFunctions);
      if (ValueOfProperty == '')
       {
        ValueOfProperty = '-';
       }
     }
    else
     {
      if (typeof(ValueOfProperty) == 'function')
       {
        if (ShowContentOfFunctions != true)
         {
          ValueOfProperty = 'Skipped...';
         }
       }
     }
     
    if (ValueOfProperty != '')
     {
      ObjectDataAsText = ObjectDataAsText + "\n" + TextPrefix +
                         NameOfProperty + ': ' + ValueOfProperty;
     }
   }

  return ObjectDataAsText;
 }

function RetrieveRequestProcessingFunction(ConfigurationOfServer, ReferenceToListOfConnectedClients)
 {
  var SendForbiddenStatusFunction = function(Response)
   {
    Response.writeHead(403);
    Response.end('Forbidden');
   }

  var Result = function(Request, Response)
   {
	 	  
    try
     {
      if (ConfigurationOfServer.Address == '')
       {
        if (Request.headers.host != (ConfigurationOfServer.AddressOfExternalServer + ':' + ConfigurationOfServer.Port))
         {
          SendForbiddenStatusFunction(Response);
          return false;
         }
       }
      else
       {
       /* if (Request.headers.host != (ConfigurationOfServer.Address + ':' + ConfigurationOfServer.Port))
         {
          SendForbiddenStatusFunction(Response);
          return false;
         }*/
       }

      var Header;
      var DataOfResponse;

      var URL = require('url');
      var QueryString = require('querystring');

      var RecivedData = '';
      var URLOfRequest;
      var TypeOfRequestIsDataForWebSocketClient = false;
      if (Request.method == 'GET')
       {
        URLOfRequest = URL.parse(Request.url, true);
        RecivedData = URLOfRequest.query;
       }
      else
       {
        URLOfRequest = URL.parse(Request.url);
       }

      var PathName = URLOfRequest.pathname;

      Request.setEncoding('utf8');

      Request.addListener('data', function(RecivedDataChunk)
       {
        RecivedData += RecivedDataChunk;
       });

      Request.addListener('end', function()
       {
        try
         {
          var ClientConnection = null;

          if (Request.method != 'GET')
           {
            RecivedData = QueryString.parse(RecivedData);
           }

          if ((RecivedData != undefined) &&
              (RecivedData != null) &&
              (RecivedData != ''))
           {
            if ((RecivedData.IDOfRecipient != undefined) &&
                (RecivedData.Data != undefined))
             {
              TypeOfRequestIsDataForWebSocketClient = true;
              var DataOfMessage = JSON.parse(RecivedData.Data);

              var RecipientOfData = null;
              if (Main.ConnectedClients[RecivedData.IDOfRecipient] != undefined)
               {
                RecipientOfData = Main.ConnectedClients[RecivedData.IDOfRecipient];
                if (RecipientOfData != null)
                 {
                  RecipientOfData.send(JSON.stringify(DataOfMessage), null, function()
                   {
                    Response.writeHead(200);
                    Response.end(JSON.stringify({Status: true}));
                   });
                 }
               }
             }
            else
             {
              DataOfResponse = JSON.stringify({URL: Request.url,
                                               Data: RecivedData});
             }
           }

          if (TypeOfRequestIsDataForWebSocketClient == false)
           {
            DataOfResponse = ConfigurationOfServer.Name + ' started at ' + ConfigurationOfServer.Address + ': ' +
                                                                           ConfigurationOfServer.Port + "\n" +
                             DataOfResponse + "\n\n" +
                             'ConnectedClients:';

            var CertificateOfClient;
            for (var IDOfConnectedClient in ReferenceToListOfConnectedClients)
             {
              DataOfResponse = DataOfResponse + "\n" +
                               '{ID: "' + ReferenceToListOfConnectedClients[IDOfConnectedClient].ID + '", ';
              CertificateOfClient = ReferenceToListOfConnectedClients[IDOfConnectedClient].CertificateOfClient;
              if (CertificateOfClient != undefined)
               {
                DataOfResponse = DataOfResponse +
                                 'Certificate: {Name: "' + CertificateOfClient.subject.CN + '", ' +
                                               'Issuer: "' + CertificateOfClient.issuer.CN + '"}';
               }
              DataOfResponse = DataOfResponse + '}';
             }
             
            Response.writeHead(200);
            Response.end(DataOfResponse);
           }
         }
        catch(Exception)
         {
          console.log('Error on processing of end data of request event: ' + Exception.message);
         }
       });
     }
    catch(Exception)
     {
      console.log('Error on request processing: ' + Exception.message);
     }
   }


  
	
  
 return Result;
 }

function WebSocketServerOnConnectionEventHandlerFunction(WebSocketServer, DataOfWebSocketServer)
 {
  var Result = function(ClientConnection)
   {
    try
     {

    	
      ClientConnection.ID = DataOfWebSocketServer.IDOfNewClient;
     // ClientConnection.CertificateOfClient = ClientConnection._sender._socket.getPeerCertificate(true);
      Main.ConnectedClients[ClientConnection.ID] = ClientConnection;
     
      ClientConnection.send(JSON.stringify({Type: 'IDOfClient',
                                            ID: ClientConnection.ID}));
      
      
      //server asks additional meta info
      ClientConnection.send(JSON.stringify({Type: 'ServerSpecific', Action :"GetMetaInfo"}));
      
     
     // Main.ConnectedEposClients[ClientConnection.ID]={AgentType:}
       
      
      
      DataOfWebSocketServer.IDOfNewClient = DataOfWebSocketServer.IDOfNewClient + 1;

      var CurrentStatusMessage = 'New client connected to ' + Main.NameOfServer + ' (ID: ' + ClientConnection.ID;
      if ((ClientConnection.CertificateOfClient != null) &&
          (ClientConnection.CertificateOfClient.subject != undefined))
       {
        CurrentStatusMessage = CurrentStatusMessage + ' ' +
                               'NameOfClient: ' + ClientConnection.CertificateOfClient.subject.CN;
       }
      CurrentStatusMessage = CurrentStatusMessage + ')';
      console.log(CurrentStatusMessage);
        
     // var DataForSend = JSON.parse(Main.mc.get('games'));
      
      ClientConnection.on('message', function(Message)
       {
    	 
        try
         {

        	var DataOfMessage = JSON.parse(Message);
 
        //IDOfRecipient - send message to 
          if (DataOfMessage.IDOfRecipient != undefined)//диспетчер (from IDOfSender/ClientConnection.ID to IDOfRecipient)
           {
            if (Main.ConnectedClients[DataOfMessage.IDOfRecipient] != undefined)
             {
              if (DataOfMessage.IDOfSender == undefined)
               {
                DataOfMessage.IDOfSender = ClientConnection.ID;
                Message = JSON.stringify(DataOfMessage);
               }

              Main.ConnectedClients[DataOfMessage.IDOfRecipient].send(Message);
              
              if (ClientConnection.ID != DataOfMessage.IDOfRecipient)///?????
               {
                ClientConnection.send(JSON.stringify({Type: 'Status',
                                                      Data: 'Message successfully send to ' + DataOfMessage.IDOfRecipient}));
               }
             }
            else
             {
              ClientConnection.send(JSON.stringify({Type: 'Status',
                                                    Data: 'Invalid ID of recipient (' + DataOfMessage.IDOfRecipient + ')'}));
             }
           }
          else //all other handlers
           {
            if (DataOfMessage.Type != undefined)
             {
              switch (DataOfMessage.Type)
               {
                case 'Broadcast':
	                 WebSocketServer.clients.forEach(function(Client)
	                  {
	                   Client.send(Message);
	                  });
	                 break;
                 
                case 'EposClientMetaInfo':               
                	//console.log("EposAgentMetaInfo: ");        
                //	console.log(DataOfMessage);        
                	
                	if (DataOfMessage.EposClientType)
                	{
                		Main.ConnectedEposClients[ClientConnection.ID]=DataOfMessage.EposClientContent;
                		
                		
                		if (DataOfMessage.EposClientType=="EposRouter")
                		{
                			if (Main.EposRouter==null)
                			{
                				console.log("New EposRouter has just been registered with ID: "+ClientConnection.ID);       
                				Main.EposRouter=ClientConnection;             
                				Main.EposRouter.send(JSON.stringify({Type: 'ServerSpecific', Action :"EposRouterRegistered", EposRouterClientID:ClientConnection.ID}));
                				
                				
                			}
                			else
                			{
                				console.log("EposRouter has been registered early (connection ID: "+ClientConnection.ID+") and new one is not allowed");                 				
                			}
                		}
                		else
                		{	
                			if (Main.EposRouter==null)
                			{
                				console.log("EposRouter was not found. So EPOS processing is failed.");  
                				
                			}
                			else
                			{
                				if (DataOfMessage.IDOfSender == undefined)
                	            {
                					DataOfMessage.IDOfSender = ClientConnection.ID;
                	                Message = JSON.stringify(DataOfMessage);
                	            }
                				Main.EposRouter.send(Message);
                				//console.log("EposAgent with connection ID: "+ClientConnection.ID+ " was redirected to EposRouter (ID: "+ Main.EposRouter.ID+ " )");       
                				
                			}
                			
                		}                		
                	}
                	              	
               
                	
                break;
                
                
                case 'RouterSpecific':       
                	if (DataOfMessage.IDOfSender == undefined)
    	            {
    					DataOfMessage.IDOfSender = ClientConnection.ID;
    	                Message = JSON.stringify(DataOfMessage);    	            	
    	            }
                	Main.EposRouter.send(Message);
	            	//console.log("EposAgent with connection ID: "+ClientConnection.ID+ " was redirected to EposRouter (ID: "+ Main.EposRouter.ID+ " )");
	            	
	            break;
                
                case 'GetSpecificAgents':
                	/*if (!isValidActionForClient(ClientConnection.ID))
                	 * Main.SuspiciousClients[ClientConnection.ID]={};
                	 * Main.SuspiciousClients[ClientConnection.ID].GetSpecificAgents=+1
                	 */
                	var theType=DataOfMessage.Content.AgentType;
                	var theTypeResult=[];
                	
                	if (theType!=null && theType!="")
                	{
	                	for (var ag in Main.ConnectedEposClients) 
	                	{                		
	                		 if( Main.ConnectedEposClients.hasOwnProperty(ag) )
	                		 {
	                			 if (Main.ConnectedEposClients[ag].AgentType==theType) theTypeResult.push(ag);                			 
	                		 } 
	                	}
	                	ClientConnection.send(JSON.stringify({Type: 'SpecificAgents', Data:theTypeResult }));
                	}
                	
                break;	

                	
                case 'UpdateBetState':
                	if (DataOfMessage.Content != undefined)  
                	{                		
                		
                		console.log("UpdateBetState: "+DataOfMessage.Content);
                		//ClientConnection
                		
                		Main.mc.get('games', function (err, value, key) {
	                		    if (value != null)
	                		    {
	                		    	console.log("games got: ");
	                		    	ClientConnection.send("Hello from UpdateBetState");
	                		    	//ClientConnection.send(value);
	                		    	//ClientConnection.send(JSON.stringify({Type: 'GameList',Data:value}));
	                		    }
                			});
                		}
                	
                 break;
               }
             }
           }
         }
        catch(Exception)
         {
          console.log('Error on processing of message from client event: ' + Exception.message);
         }
       });

      ClientConnection.on('close', function(code, message)
       {
        try
         {
        	
        	//var tempID=ClientConnection.ID;
        	
        		if (Main.EposRouter && Main.EposRouter.ID==ClientConnection.ID) Main.EposRouter=null;
        		delete Main.ConnectedClients[ClientConnection.ID];
         
        		
          if ( ClientConnection.ID in Main.ConnectedEposClients)  
          {
        	
        	   	  if (Main.EposRouter) Main.EposRouter.send(JSON.stringify({Type: 'ServerSpecific', Action :"EposClientDisconnect", EposAgentClientID:ClientConnection.ID}));
	        	  delete Main.ConnectedEposClients[ClientConnection.ID];        	  
          }
          
          
          
          var CurrentStatusMessage = 'Client (ID: ' + ClientConnection.ID;
          if ((ClientConnection.CertificateOfClient != null) &&
              (ClientConnection.CertificateOfClient.subject != undefined))
           {
            CurrentStatusMessage = CurrentStatusMessage + ' ' +
                                   'NameOfClient: ' + ClientConnection.CertificateOfClient.subject.CN;
           }
          CurrentStatusMessage = CurrentStatusMessage + ') disconnected from ' + Main.NameOfServer + ' code: ' + code;

          console.log(CurrentStatusMessage);
         }
        catch(Exception)
         {
          console.log('Error on processing of close client connection event: ' + Exception.message);
         }
       });
     }
    catch(Exception)
     {
      console.log('Error on processing of client connection event: ' + Exception.message);
     }
   }

  return Result;
 }

function StartSecureWebSocketServer(Configuration, ParametersOfServer, ConnectedClients)
 {
  try
   {
	  
    var PathToSSLDataDirectory = ParametersOfServer.SSL_Information.PathToSSLDataDirectory;
    var PathToDHParametersFile = PathToSSLDataDirectory + ParametersOfServer.SSL_Information.DHParametersFile;
    var PathToCertificatesDirectory = PathToSSLDataDirectory + ParametersOfServer.SSL_Information.NameOfCertificatesDirectory + '/';
    var PathToMainCertificateFile = PathToCertificatesDirectory + ParametersOfServer.SSL_Information.MainCertificateFile;

    if ((Configuration.Address == '') &&
        (Configuration.AddressOfExternalServer != undefined))
     {
      PathToCertificatesDirectory = PathToCertificatesDirectory + Configuration.AddressOfExternalServer;
     }
    else
     {
      PathToCertificatesDirectory = PathToCertificatesDirectory + Configuration.Address;
     }

    PathToCertificatesDirectory = PathToCertificatesDirectory + '/';
    var PathToCertificateKeyFile = PathToCertificatesDirectory + ParametersOfServer.SSL_Information.KeyFile;
    var PathToCertificateFile = PathToCertificatesDirectory + ParametersOfServer.SSL_Information.CertificateFile;

    var SecureServerApplication = Main.SecureHTTPServer.createServer(RetrieveRequestProcessingFunction(Configuration, ConnectedClients));
    SecureServerApplication.listen(Configuration.Port, Configuration.Address);
    SecureServerApplication.addListener('upgrade', UpgrateEventHandlerFunction);

   
    
    
    var WebSocketServer = new Main.WebSocketServer({server: SecureServerApplication,
                                                    verifyClient: MethodForVerifyClient});
                                              
    WebSocketServer.on('connection', WebSocketServerOnConnectionEventHandlerFunction(WebSocketServer, Main));
   
    console.log(Configuration.Name + ' started at ' + Configuration.Address + ': ' + Configuration.Port);
   }
  catch(Exception)
   {
    console.log('Error on start of secure websocket server: ' + Exception.message);
   }
 }

function UpgrateEventHandlerFunction(Request, Socket, Header)
 {
  Request.on('upgrade', function(Response, Socket, UpgradeHead)
   {
    try
     {
     }
    catch(Exception)
     {
      console.log('Error on processing of upgrade client connection event: ' + Exception.message);
     }
   });
 }

function MethodForVerifyClient(Information, CallbackFunction)
 {
  CallbackFunction(true, 200, 'OK');
 }

function timeStamp() {
	// Create a date object with the current time
	  var now = new Date();

	// Create an array with the current month, day and time
	  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

	// Create an array with the current hour, minute and second
	  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

	// Determine AM or PM suffix based on the hour
	  var suffix = ( time[0] < 12 ) ? "AM" : "PM";

	// Convert hour from military time
	  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

	// If hour is 0, set it to 12
	  time[0] = time[0] || 12;

	// If seconds and minutes are less than 10, add a zero
	  for ( var i = 1; i < 3; i++ ) {
	    if ( time[i] < 10 ) {
	      time[i] = "0" + time[i];
	    }
	  }

	// Return the formatted string
	  return date.join("/") + " " + time.join(":") + " " + suffix;
	}




function Main()
 {
  try
   {
    if (Main.Executed == true) {return false;}
    Main.Executed = true;

    "use strict";
      
    var ParametersOfSecureServer = require('./ParametersOfWebSocketServer.js').Load();
    var ParametersOfServer = ParametersOfSecureServer;

    Main.NameOfServer = 'Secure WebSocket Server';
    Main.IDOfNewClient = 1;
    Main.ConnectedClients = {};
    Main.ConnectedEposClients={}; 
    Main.EposRouter=null;
    
    
    Main.GetBetStatistics=false;
    Main.GetMatchStatistics=false;
    Main.ProcessDesionMaking=false;
    Main.CreateUserListForSignalSending=false;
    
    Main.GamesMode="GamesOff";
    
    Main.AdditionalRequest=false;

    Main.SecureHTTPServer = require('http');
    Main.WebSocketServer = require('ws').Server;
   // Main.FileSystem = require('fs');
    Main.MakeRequest = require('request');     
   // Main.memjs = require('memjs');    
   // Main.mc = Main.memjs.Client.create('127.0.0.1:11211');
    Main.EventEmitter = require('events').EventEmitter;      
    Main.EposEventHandler = new Main.EventEmitter;  
      
  
    
  
    
    
    if (Main.GetBetStatistics)
    {
    	console.log("Main.GetBetStatistics is launched");
    	setInterval(GetCurrentStatistic, 120000);
    }
    
    
    if (Main.ProcessDesionMaking)
    {
    	//setInterval(MakeDesions, 60000);
    }
    
    
    

    for (var Index in ParametersOfServer.Configurations)
     {
      StartSecureWebSocketServer(ParametersOfServer.Configurations[Index],
                                 ParametersOfServer,
                                 Main.ConnectedClients);
     }
     
   }
  catch(Exception)
   {
    console.log('Error in Main function: ' + Exception.message);
   }
 }

Main();
