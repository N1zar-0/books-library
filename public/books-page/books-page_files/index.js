var drawItemsOnScroll,
    isScrollRunning = false;
console.log(isScrollRunning);

$(document).ready(function () {

    (function () {

        data = {
            filter: getParameterByName('filter') || "new",
            offset: Number(getParameterByName('offset')),
            limit: global.items_limit_on_page_load
        };

        setSidebarActiveButton(null, data.filter);
        loadIndexPage(data);
        // doAjaxQuery('GET', '/api/v1/books', data, function (res) {
        //     console.log('qindex');
        //     view.addBooksItems(res.data.books, true);
        //     drawItemsOnScroll = initDrawItemsOnScroll(res.data.total.amount);
        //     if (localStorage.getItem('h')) {
        //         $(window).scrollTop(localStorage.getItem('h'));
        //         localStorage.removeItem('h');
        //     }
        // });
    }());

    $('#content').on('click', '.book', function () {
        localStorage.setItem('h', $(window).scrollTop());
    });

    $('#prevPage').on('click', function () {
        data.offset -= global.items_limit_on_page_load;
        if (data.offset < 0) data.offset = 0;
        loadIndexPage(data);
    });

    $('#nextPage').on('click', function () {
        data.offset += global.items_limit_on_page_load;
        loadIndexPage(data);
    });

    // $(document).scroll(function () {
    //     if ((( $(document).height() - $(window).scrollTop() ) < ( 2 * $(window).height() )) && !isScrollRunning) {
    //         isScrollRunning = true;
    //         drawItemsOnScroll();
    //     }
    // });
});

function getParameterByName(name, url) {
    if (!url) url = $(location).attr('href');
    // console.log(url);
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// var initDrawItemsOnScroll = function (maxItems) {
//     var maxNumOfItems = maxItems,
//         limit = global.number_of_items_onscroll,
//         offset = parseInt(getParameterByName('count')) || global.items_limit_on_page_load;
//
//     return function () {
//         if (offset < maxNumOfItems) {
//             var data = {
//                 'filter': getParameterByName('filter') || "new",
//                 'limit': limit,
//                 'offset': offset
//             };
//             $("#loading").slideDown();
//             doAjaxQuery('GET', '/api/v1/books', data,
//                 function (res) {
//                     $("#loading").slideUp();
//                     isScrollRunning = false;
//                     view.addBooksItems(res.data.books, false);
//                     changeHistoryStateWithParams("replace", res.data.filter, res.data.offset);
//                 });
//             offset += limit;
//         }
//     }
// };

function loadIndexPage(reqData) {
    doAjaxQuery('GET', '/api/v1/books', reqData, function (res) {
        view.addBooksItems(res.data.books, true);
        changeHistoryStateWithParams('push', data.filter, data.offset);
        // drawItemsOnScroll = initDrawItemsOnScroll(res.data.total.amount);

        if (res.data.total.amount > data.offset + data.limit)
            $('#nextPage').show();
        else
            $('#nextPage').hide();

        if (data.offset > 0)
            $('#prevPage').show();
        else
            $('#prevPage').hide();
    });
}

function setSidebarActiveButton(activeElem, filterStringValue) {
    $('.sidebar_item').removeClass('active');
    if (activeElem) {
        activeElem.closest('a').addClass('active');
        return;
    } else {
        $('a[data-filter=' + filterStringValue + ']').addClass('active');
    }
}
