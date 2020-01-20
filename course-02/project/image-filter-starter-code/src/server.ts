import express, { Request, Response } from 'express';
import { NextFunction } from 'connect';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req: Request, res: Response, next: NextFunction) => {
      const { query = {} } = req;
      const { image_url: imageUrl } = query;

      if(!imageUrl) return res.status(422).send({ message: 'image_url cannot be empty' });

      let fileName = "";
      try {
        fileName = await filterImageFromURL(imageUrl);
      } catch(parseFileError) {
        return res.status(422).send({ message: 'could not parse image from url' });
      }

      res.sendFile(fileName, {}, function (err) {
        if (err) {
          next(err)
        } else {
          deleteLocalFiles([fileName]);
          next();
        }
      })
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();