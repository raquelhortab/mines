To use local changes:
``` 
cd ..
npm link 
cd example 
npm i 
npm link mines
```
check it worked
``` 
ls -l node_modules/ | grep mines
```
You might need to run `npm run dist` (on mines directory) and `npm link` again, and `npm link mines` again in example directory.