package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

   func main() {
       http.HandleFunc("/getHtmlFromUrl", func(w http.ResponseWriter, r *http.Request) {
           // 允许所有来源的跨域请求
           w.Header().Set("Access-Control-Allow-Origin", "*")
           w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

           url := r.URL.Query().Get("url")
           if url == "" {
               http.Error(w, "URL parameter is missing", http.StatusBadRequest)
               return
           }

           resp, err := http.Get(url)
           if err != nil {
               log.Println(err)
               http.Error(w, "Failed to fetch the URL", http.StatusInternalServerError)
               return
           }
           defer resp.Body.Close()

           body, err := ioutil.ReadAll(resp.Body)
           if err != nil {
               log.Println(err)
               http.Error(w, "Failed to read the response body", http.StatusInternalServerError)
               return
           }

           w.Write(body)
       })

       port := 30000
       log.Printf("Server is running at http://localhost:%d\n", port)
       log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
   }