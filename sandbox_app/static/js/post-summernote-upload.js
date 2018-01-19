$(document).ready(function () {
    // Select summernote container (div or textarea)
    var $sn = $('#id_body');

    $sn.summernote({
        placeholder: 'Please, type your message',
        tabsize: 2,
        height: 300,
        callbacks: {
            onInit: function () {
                $nEditor = $sn.next();
                $nImageInput = $nEditor.find('.note-image-input');
            },
            onImageUpload: function (files) {
                var formData = new FormData();

                $.each(files, function (index, file) {
                    formData.append('files', file);
                });

                $.ajax({
                    url: '/upload-file',         // Point to django upload handler view
                    type: 'post',
                    processData: false,     // file-transfer
                    contentType: false,     // file-transfer
                    data: formData
                }).done(function (data, textStatus, jqXHR) {
                    $.each(data.files, function (index, file) {
                        // Insert image into the editor
                        $sn.summernote('insertImage', file.url);

                        //
                        // YOU MUST IMPLEMENT YOUR OWN CODE HERE:
                        //
                        // Thumbnail image is appended.
                        $('#thumbnail-list').append(
                            '<div id="thumbnail-card-' + file.pk + '" class="col-lg-2 col-md-3 col-sm-4 mt-2">\n' +
                            '  <div class="card h-100">\n' +
                            '    <div class="card-body">\n' +
                            '      <img class="card-img-top thumbnail-image" src="' + file.url + '">\n' +
                            '    </div>\n' +
                            '    <div class="card-footer text-center">\n' +
                            '      <a href="#" id="thumbnail-' + file.pk + '"\n' +
                            '           class="btn-sm btn-danger thumbnail-delete-button">Delete</a>\n' +
                            '    </div>\n' +
                            '  </div>\n' +
                            '</div>');

                        // This hidden field must be sent in order to make a relationship.
                        $('<input>', {
                            type: 'hidden',
                            name: 'attachments',
                            value: file.pk
                        }).appendTo('form');
                    });
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    console.error('Failed to upload');
                });
            }
        }
    });

    $(document).on('click', '.thumbnail-image', function () {
        // Insert image into the editor when clicked thumbnail images
        $sn.summernote('insertImage', $(this).attr('src'));
    });

    $(document).on('click', '.thumbnail-delete-button', function () {
        $.ajax({
            url: '/delete-file',
            type: 'post',
            data: {file_pk: $(this).attr('id').split('-')[1]}
        }).done(function (data, textStatus, jqXHR) {
            $.each(data.files, function (index, file) {
                // Remove thumbnail image itself
                $('#thumbnail-card-' + file.pk).remove();

                // Remove hidden field (It's saved if not removed)
                $('input:hidden[name=attachments][value=' + file.pk + ']').remove();
            });
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Failed to delete');
        });
    });
});

