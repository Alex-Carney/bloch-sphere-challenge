I am definitely not deploying the right way, but I'm recording this so that I can always do it in the future.

First, run `vite build` to ensure that the build is up-to-date.
Then, run `vite preview` and assess the validity of the build. 

On GitHub, navigate to branch gh-pages, and manually upload all the contents
of the dist folder. Do not upload the dist folder itself, only the contents inside it. 

Then, navigate to Actions within the repository, click on `pages build and deployment`, and rerun the workflow.