define(["knockout", "main/Config", "dojo/dom", "dojo/_base/array"],
    function(ko, Config, dom, array) {

        var o = {};

        o.vm = {};


        var vm = o.vm;

        vm.blogPost = ko.observableArray([]);

        vm.homeTitle = ko.observable(Config.homeTitle);

        o.applyBindings = function(domId) {
            ko.applyBindings(vm, dom.byId(domId));
        }

        o.addPosts = function (Posts) {
            // add arrays
            Posts['articles'].forEach(function (item) {
                item.getAuthors = function () {
                    var authors = this.author.split(",");

                    var result = [];
                    var cont = false;

                    array.forEach(authors, function (item, index) {




                       if ( index == 0 && authors.length != 2)
                       { // remove by from the author and add the author to the list
                           result.push("by");
                           result.push(item.substring(3,item.length));
                       }
                       else if ( authors.length == 2 && index == 0 )
                       {
                           var a = item.split("-");

                           result.push("by");
                           result.push(a[0].substring(3,item.length));
                           result.push(a[1].trim() + authors[index+1]);

                       }
                       else if ( index == authors.length-2)
                       { // seperate the n-2 index of the array and make it 3, and concat the string.
                           var a = authors[index].split("and");
                           // the first item in the set is fine
                           result.push(a[0].trim());
                           result.push("and");

                           // more logic
                           var b = a[1].split("-")
                           result.push(b[0].trim())
                           result.push(b[1]+authors[index+1]);
                       }
                       else if ( index == authors.length-1)
                       {
                           // do nothing
                       }
                       else
                       {
                           result.push(item.trim());
                       }
                    })
                    return result;
                };
            });

            o.vm.blogPost.push(Posts);


        }

        vm.getAllPost = function () {
            console.log(o.vm.blogPost()[0]['articles']);
            return o.vm.blogPost()[0]['articles'];
        }

        // TODO: each blog post should have a getAuthor functions that return the correct string for the authors. There are two ways to do this as of right now: 1. add it manually, or 2. ko.computed.
        vm.getAuthors = function () {
            console.log('Authors are :' + authors);
        };

        return o;

    })