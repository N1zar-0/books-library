let offset = 0,
    limit = 4,
    total,
    currentPage = 1,
    paginationMax = 7;

$(document).ready(function () {
    fetchBooks();

    $("#pagination").on('click', '.page-link', function(event) {
        event.preventDefault();
        const page = parseInt($(this).data('page'));
        if (!isNaN(page) && page > 0 && page <= Math.ceil(total / limit)) {
            currentPage = page;
            fetchBooks(page);
        }
    });

    $('#addBookForm').submit(function () {
        let formData = new FormData(this);

        $.ajax({
            url: 'http://localhost:3000/api/v1/books',// change url
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(res) {
                if (!res.success) {
                    view.showError(res.msg);
                    return;
                }
                alert('Книгу успішно додано!');
            },
            error: function(jqXHR, textStatus) {
                view.showError('Ошибка ' + textStatus);
            }
        });
    });

    $("#logout").on('click', function() {
       //todo
    });
});

function fetchBooks(page = 1) {
    offset = (page - 1) * limit;
    let data = { offset, limit };

    doAjaxQuery('GET', "http://localhost:3000/api/v1/books", data, function(res) { // change url
        total = res.data.total.amount;
        console.log(res.data.books);
        view.addBooksList(res);
        renderPagination();
    });
}

function deleteBook(id) {
    if (!confirm('Ви впевнені, що хочете видалити цю книгу?')) return;

    doAjaxQuery('DELETE', `http://localhost:3000/api/v1/books/${id}`, {}, function (res) { // change url
        alert('Книгу успішно видалено!');
    });
}


function renderPagination() {
    const totalPages = Math.ceil(total / limit);
    const pagination = $('#pagination');
    pagination.empty();

    if (totalPages <= 1) return;

    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';

    pagination.append(`<li class="page-item ${prevDisabled}">
        <a class="page-link" data-page="${currentPage - 1}">«</a>
    </li>`);

    let pages = [];

    if (totalPages <= paginationMax) {
        pages = [...Array(totalPages).keys()].map(i => i + 1);
    } else {
        pages = [1, 2];

        if (currentPage > 4) {
            pages.push('...');
        }

        let start = Math.max(3, currentPage - 1);
        let end = Math.min(totalPages - 2, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 3) {
            pages.push('...');
        }

        pages.push(totalPages - 1, totalPages);
    }

    pages.forEach(page => {
        if (page === '...') {
            pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
        } else {
            const activeClass = page === currentPage ? 'active' : '';
            pagination.append(`<li class="page-item ${activeClass}">
                <a class="page-link" data-page="${page}">${page}</a>
            </li>`);
        }
    });

    pagination.append(`<li class="page-item ${nextDisabled}">
        <a class="page-link" data-page="${currentPage + 1}">»</a>
    </li>`);
}