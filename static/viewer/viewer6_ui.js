
/*
The MIT License (MIT)

Copyright (c) 2013 Rémi Arnaud - Advanced Micro Devices, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/
'use strict';
define(['viewer', 'gui', 'uploadViewer', 'rest3d', 'q', 'collada', 'gltf', 'renderer', 'state', 'channel'],
    function (viewer, gui, setViewer6Upload, rest3d, Q, COLLADA, glTF, RENDERER, State, Channel) {

        viewer.databases = {};
        viewer.idUser = "User_" + Math.floor(Math.random() * 100000000000000) + 1;
        viewer.INIT = function () {
            "use strict"; //
            var mask;
            var win = $('');

            if (!window.performance || !window.performance.now) {
                window.performance = window.performance || {};
                window.performance.now = $.now
            };
            var listThemes = ["black-tie", "blitzer", "cupertino", "dark-hive", "dot-luv", "eggplant", "excite-bike", "flick", "hot-sneaks", "humanity", "le-frog", "mint-choc", "overcast", "pepper-grinder", "redmond", "smoothness", "south-street", "start", "sunny", "swanky-purse", "trontastic", "ui-darkness", "ui-lightness", "vader"];
            var renderMenu = $('');
            var flagStatus = false;
            var url = "http://www.google.com/custom?q=fl4re&btnG=Search";
            var bufferGen = $("");

            window.fl4reStatus = function (type, _parent, text) {
                $('#copyButton').remove();
                $('#iconStatus').remove();
                $('#defaultText').remove();
                $('#defaultTextBis').remove();
                if (type == 'CLEAR' || type == 'READY') {
                    GUI.label("defaultText", "ready", _parent);
                    GUI.addIcon(_parent, "ui-icon-circle-check", "float:left;margin:3px;", "before").attr('id', 'iconStatus');
                }
                else if (type == 'BUSY') {
                    GUI.label("defaultText", text, _parent);
                    GUI.addIcon(_parent, "ui-icon-clock", "float:left;margin:3px;", "before").attr('id', 'iconStatus');;
                }
                else if (type == 'ERROR') {
                    GUI.label("defaultText", text, _parent);
                    GUI.addIcon($("#mainLayout-south"), "ui-icon-circle-close", "float:left;margin:3px;", "before").attr('id', 'iconStatus');;
                }
                else if (type == 'WARNING') {
                    GUI.label("defaultText", text, _parent);
                    GUI.addIcon($("#mainLayout-south"), "ui-icon-alert", "float:left;margin:3px;", "before").attr('id', 'iconStatus');;
                }
                else {
                    var label = GUI.label("defaultTextBis", text, _parent);
                    GUI.addIcon(_parent, "ui-icon-info", "float:left;margin:3px;", "before").attr('id', 'iconStatus');
                    var clear = GUI.button("Clear", label, function () {
                        GUI.copyToClipboard(text.slice(15, -1));
                        GUI.addTooltip({
                            parent: $('this'),
                            content: "copy completed!"
                        });
                    });
                    clear.prop("id", "copyButton");
                    clear.html('');
                    GUI.addIcon(clear, "ui-icon-copy", "", "before");
                    GUI.addTooltip({
                        parent: clear,
                        content: "copy URL to clipboard"
                    });
                }
            };

            window.loadCss = function (item) {
                var link = "../gui/themes/" + item + "/jquery-ui.css";
                GUI.destroyCurrentCssTheme();
                GUI.loadCssFile(link);
                GUI.currentCssTheme = link;
                setTimeout(function () {
                    GUI.setColorJqueryTheme();
                    GUI.refreshJqueryTheme();
                }, 10);


            }

            function pleaseWait(_displayMode) {
                if (!mask) {
                    mask = $([]);
                }
                if (_displayMode == true) {
                    var deferred = Q.defer();
                    mask = GUI.mask("mask-loading", "Please wait ...", $("body"));
                    GUI.image($('#mask-loading'), "img-loading", "../gui/images/loading.gif", 30, 30, "before");
                    return deferred;
                }
                else if (_displayMode == false) {
                    setTimeout(function () {
                        mask.remove();
                    }, 500);
                }
            };
            window.pleaseWait = pleaseWait;
            var layout = GUI.Layout("mainLayout", 1);



            var titleLabel = GUI.label("auteur", "@ rest3d.org", layout.jqueryObjectSouth);
            titleLabel.click(function () {
                $("#dialog").dialog("close");
                var gitHtml = '<div id="dialog"><iframe id="myIframe" src="" style="height:100% !important; width:100% !important; border:0px;"></iframe></div>';
                gitPanel = $('body').append(gitHtml);
                $("#dialog").dialog({
                    width: '600',
                    height: '500',
                    open: function (ev, ui) {
                        $('#myIframe').attr('src', "http://rest3d.wordpress.com/");
                    },
                    // close: function(){
                    //     gitHtml.empty();
                    // },
                });
                $("#dialog").css({
                    "padding": "0",
                })
            })
            CONSOLE.open(layout);

            ////////////
            //        GUI.button('rambler-min', accordion.collada, function () {

            window.callbackFullscreen = function () {
                if (screenfull.enabled) {
                    screenfull.request();
                }
                else {
                    console.error("browser doesn't allow the fullscreen mode")
                }
            };
            var $html = $('<a href="#" onClick="window.callbackFullscreen()"></a>')
            $('body').append()
            $html.hide();

            var menu = GUI.menu({
                id: "menu",
                parent: layout.jqueryObjectNorth,
                item: [{
                    text: "Welcome guest!",
                    id: "welcomeMenu"
                }, {
                    text: "Settings",
                    id: "settings"
                }, {
                    text: "Themes UI",
                    id: "themes"
                }, {
                    text: "Support",
                    id: "support"
                }, {
                    text: "b",
                    id: "fullscreen",
                    callback: function () {
                        $html.click();
                    },
                }]
            });

            GUI.mainMenu = menu;


            // --------------------------------------------------------- support and help ----------------------------------

            var supportMenu = GUI.menu({
                id: "support-menu",
                parent: menu.support,
                item: [{
                    id: "help-panel",
                    text: "Help",
                    callback: "window.onHelp()"
                }, {
                    id: "google",
                    text: "Google",
                    callback: "window.onGithub()"
                }]
            })

            var helpPanel = $([]);

            //help dialog
            window.onHelp = function () {}

            var gitPanel = $([]);
            window.onGithub = function () {
                $("#dialog").dialog("close");
                var gitHtml = '<div id="dialog"><iframe id="myIframe" src="" style="height:100% !important; width:100% !important; border:0px;"></iframe></div>';
                gitPanel = $('body').append(gitHtml);
                $("#dialog").dialog({
                    width: 600,
                    height: 500,
                    open: function (ev, ui) {
                        $('#myIframe').attr('src', url);
                    },
                    //  close: function(){
                    //     gitHtml.empty();
                    // },
                });
                $("#dialog").css({
                    "padding": "0",
                })

            }

            //////////////
            // THEMES MENU

            var listCallback = [];
            var jsonTheme = {
                id: 'theme-menu',
                parent: menu.themes,
                item: []
            };
            for (var lgt = 0; lgt < listThemes.length; lgt++) {
                jsonTheme.item[lgt] = {
                    text: listThemes[lgt],
                    id: listThemes[lgt],
                    callback: function (theme) {
                        return function () {
                            pleaseWait(true);
                            window.loadCss(theme);
                            pleaseWait(false);
                        }
                    }(listThemes[lgt])

                };
            }
            var theme = GUI.menu(jsonTheme);
            theme.setAutoHeight();


            //------------------------------ all menu icons ---------------------------------------------------------------------------------------------
            GUI.image(menu.welcomeMenu.text, "img-settings", "../gui/images/particles.gif", 16, 16, "before");
            GUI.image(menu.settings.text, "img-settings", "../gui/images/icon-cog.png", 16, 16, "before");
            GUI.image(menu.support.text, "img-help", "../gui/images/menu-help.png", 15, 15, "before");
            GUI.image(menu.themes.text, "img-themes", "../gui/images/jquery.png", 15, 15, "before");
            GUI.addIcon(menu.fullscreen.text, "ui-icon-arrow-4-diag", "position: relative !important; right:10px !important;bottom: 10px !important;", "before");
            menu.fullscreen.moveToRightFromLeft();
            menu.support.moveToRightFromLeft(40);
            menu.themes.moveToRightFromLeft(150);
            menu.settings.moveToRightFromLeft(275);

            //------------------------------//render menu ---------------------------------------------------------------------------------------------

            var renderMenu = GUI.tab({
                id: "renderMenus",
                parent: layout.jqueryObjectCenter,
                item: [{
                        id: "render",
                        text: "  Load DAE/glTF"
                    },
                    // {
                    //     id: "tree",
                    //     text: "  Warehouse",
                    // },
                    {
                        id: "scenes",
                        text: " Scenes",
                    }

                ]
            })
            renderMenu.sortable();
            renderMenu.tabManager();
            var $flagScene = $("<h3 style='text-align:center !important;'>No scenes loaded yet</h3>");
            renderMenu.scenes.append($flagScene);

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            var treeScene = false;
            var treeJson = {};
            var callbackArray = [];

            window.refreshScenesTree = function () {
                $flagScene.hide();
                if (treeScene) {
                    treeScene.remove();
                }
                callbackArray = [];
                treeJson.data = [];

                function displayConfig(parent, object, attr) {
                    if (parent.hasOwnProperty(attr)) {
                        if (parent.hasOwnProperty('pickid')) {
                            var id = attr + "_" + (Math.floor(Math.random() * 1000000) + 1) + "__" + parent.pickid;
                        }
                        else {
                            var id = attr + "_" + (Math.floor(Math.random() * 1000000) + 1);
                        }

                        // {"data":attr,"attr":{"id":id}}
                        var data = {};
                        data.data = attr;
                        if (attr == "znear" || attr == "zfar" || attr == "yfov" || attr == "projection" || attr == "aspect_ratio") {
                            data.attr = {
                                "id": id,
                                'rel': 'camera_child'
                            }
                        }
                        else if (attr == "local") {
                            data.attr = {
                                "id": id,
                                'rel': 'local'
                            }
                        }
                        else {
                            data.attr = {
                                "id": id,
                                'rel': 'material'
                            }
                        }
                        object.push(data); //TODO change to an ID more elaborated
                        var tmp = {}
                        tmp.id = id;
                        tmp.type = attr;
                        tmp.value = parent[attr];
                        tmp.parent = parent;
                        callbackArray.push(tmp);
                    };
                    return object;
                }

                window.material = function (param_in) {
                    var stock = param_in;
                    var material = {};
                    material.children = [];
                    if (param_in.hasOwnProperty('pickid')) {
                        var pickId = param_in.pickid;
                    }
                    if (stock.hasOwnProperty('materials')) {
                        for (var z = 0; z < stock.materials.length; z++) {
                            var subsel_material = stock.materials[z];
                            material.data = subsel_material.name || subsel_material.id || subsel_material.symbol || subsel_material.target;
                            if (pickId) {
                                var id = material.data + "_" + (Math.floor(Math.random() * 1000000) + 1) + "__" + pickId;
                            }
                            else {
                                var id = material.data + "_" + (Math.floor(Math.random() * 1000000) + 1);
                            }
                            material.attr = {
                                "rel": "children",
                                "id": id
                            };
                            material.children = [];
                            var material_parameter = subsel_material.overrides || subsel_material.parameters;
                            if (pickId) {
                                material_parameter.pickid = pickId;
                            }
                            displayConfig(material_parameter, material.children, "ambient");
                            displayConfig(material_parameter, material.children, "diffuse");
                            displayConfig(material_parameter, material.children, "emission");
                            displayConfig(material_parameter, material.children, "index_of_refraction");
                            displayConfig(material_parameter, material.children, "reflective");
                            displayConfig(material_parameter, material.children, "reflectivity");
                            displayConfig(material_parameter, material.children, "shininess");
                            displayConfig(material_parameter, material.children, "specular");
                            displayConfig(material_parameter, material.children, "transparent");
                        }
                    }
                    return material;
                }

                window.geometry = function (param_in, param_out) {
                    if (param_in.hasOwnProperty("pickid")) {
                        var pickID = param_in.pickid;
                    }
                    if (param_in.hasOwnProperty("geometries") && $.isArray(param_in.geometries)) {
                        for (var i = 0; i < param_in.geometries.length; i++) {
                            var subsel_geometries = param_in.geometries[i];
                            if (pickID) {
                                subsel_geometries.pickid = pickID;
                            }
                            var material = self.material(subsel_geometries);
                            var title = "geometry_" + i;
                            if (i == 0) {
                                title = "geometry"
                            }
                            var id = title + "__" + pickID;
                            var subchild = {
                                "data": title,
                                "attr": {
                                    "rel": "geometry",
                                    "id": id
                                },
                                "children": [{
                                    "data": "materials",
                                    "attr": {
                                        "rel": "children",
                                        "id": "material" + "__" + pickID
                                    },
                                    "children": [material],
                                }, ],
                            };
                            param_out.push(subchild);
                        }
                    }
                    return param_out;
                }

                window.camera = function (param_in, param_out) {
                    if (param_in.hasOwnProperty("pickid")) {
                        var pickID = param_in.pickid;
                    }
                    if (param_in.hasOwnProperty("camera")) {
                        var subsel_camera = param_in.camera;
                        if (pickID) {
                            subsel_camera.pickid = pickID;
                        }
                        displayConfig(subsel_camera, param_out, "aspect_ratio");
                        displayConfig(subsel_camera, param_out, "projection");
                        displayConfig(subsel_camera, param_out, "yfov");
                        displayConfig(subsel_camera, param_out, "zfar");
                        displayConfig(subsel_camera, param_out, "znear");
                    }
                    return param_out;
                }

                window.children = function (param_in, param_out) {
                    if (param_in.hasOwnProperty("children")) {
                        for (var i = 0; i < param_in.children.length; i++) {
                            var sel = param_in.children[i];
                            if (sel.hasOwnProperty("geometries")) {
                                var pickId = sel.geometries[0].glprimitives[0].pickID;
                                sel.pickid = pickId;
                            }
                            else {
                                for (var z = 0; z < length; z++) {
                                    if (param_in.children[z].hasOwnProperty("pickid")) {
                                        var pickId = target[z].pickid;
                                        sel.pickid = pickId;
                                    }
                                }
                            }
                            var child = {};
                            var title = sel.id || sel.name || "undefined_" + Math.floor(Math.random() * 1000000) + 1;
                            child.data = sel.id || sel.name || title;
                            child.state = 'closed';
                            var id = child.data;
                            if (pickId) {
                                id = id + "__" + pickId
                            }
                            window[id] = sel;
                            child.attr = {
                                "id": id,
                                "rel": "child"
                            };
                            child.attr["type"] = sel.id;
                            param_out.push(child);
                        }
                    }
                    return param_out;
                }
                window.main = function (param_in, param_out) {
                    for (var i = 0; i < param_in.length; i++) { //{
                        var sel = param_in[i]
                        var scene = {};
                        scene.data = sel.url.replace(/^.*[\\\/]/, ''); //data:
                        scene.state = 'closed';
                        var id = scene.data + "_" + Math.floor(Math.random() * 1000000) + 1;
                        window[id] = sel;
                        scene.attr = {
                            "id": id,
                            "rel": "main"
                        }
                        param_out.push(scene);
                    }
                    return param_out;
                }
                window.sub = function (param_in, param_out) {
                    var length = param_in.length;
                    var target = param_in;
                    if (param_in.hasOwnProperty("id")) {
                        length = 1;
                        target = [];
                        target[0] = param_in;
                    }
                    for (var j = 0; j < length; j++) {
                        var position = target[j];
                        var sub = {};

                        sub.data = position.id || position.name;
                        if (position.hasOwnProperty("geometries")) {
                            var pickId = position.geometries[0].glprimitives[0].pickID;
                            position.pickid = pickId;
                        }
                        else {
                            for (var z = 0; z < length; z++) {
                                if (target[z].hasOwnProperty("pickid")) {
                                    var pickId = target[z].pickid;
                                    position.pickid = pickId;
                                }
                            }
                        }
                        var id = sub.data;
                        if (pickId) {
                            id = id + "__" + pickId;
                        }
                        sub.state = 'open';

                        if (position.hasOwnProperty("camera")) {
                            sub.attr = {
                                "id": id,
                                "rel": "camera"
                            };
                        }
                        if (position.hasOwnProperty("geometries")) {
                            sub.attr = {
                                "id": id,
                                "rel": "geometry"
                            };
                        }
                        if (position.hasOwnProperty("children")) {
                            sub.attr = {
                                "id": id,
                                "rel": "children"
                            };
                        }
                        // if(position.hasOwnProperty("local")){
                        //      sub.attr = {"id":id,"rel":"local"};
                        // }
                        else {
                            sub.attr = {
                                "id": id,
                                "rel": "sub"
                            };
                        }
                        // sub.attr["type"] = position.id;
                        sub.children = [];
                        window.geometry(position, sub.children);
                        window.camera(position, sub.children);
                        window.children(position, sub.children);
                        displayConfig(position, sub.children, "local");
                        param_out.push(sub);
                    }
                    return param_out;
                }

                function removeModel(node) {
                    var id = node.attr("id").split("_")[0];
                    for (var i = 0; i < viewer.scenes.length; i++) {
                        if (viewer.scenes[i].hasOwnProperty("url")) {
                            if (viewer.scenes[i].url.replace(/^.*[\\\/]/, '') == id) {
                                viewer.scenes[i] = [];
                                viewer.draw();
                                viewer.scenes.splice(i, 1);
                            }
                        }
                    }
                    $(node).remove();
                }

                var nodeBuffer;
                treeScene = GUI.treeBis({
                    id: 'Tree',
                    parent: renderMenu.scenes,
                    json: {
                        "ajax": {
                            "type": 'GET',
                            "url": function (node) {
                                nodeBuffer = node;
                                var nodeId = "";
                                var url = "/rest3d/info/";
                                return url;
                            },
                            "success": function (new_data) {
                                var result = [];
                                if (nodeBuffer == -1) {
                                    console.debug(viewer.scenes);
                                    window.main(viewer.scenes, result)
                                }
                                else {
                                    var viewerObject;
                                    switch (nodeBuffer.attr('rel')) {
                                    case "main":
                                        viewerObject = window[nodeBuffer.attr('id')];
                                        window.sub(viewerObject, result);
                                        break;
                                    case "child":
                                        viewerObject = window[nodeBuffer.attr('id')];
                                        window.sub(viewerObject, result);
                                        break;
                                    }
                                }
                                window.callbacks();
                                return result;
                            },
                        },
                    },
                    "contextmenu": {
                        "items": function (node) {
                            var result = {};
                            if (node.attr("rel") == "main") {
                                result.icon = {
                                    'label': 'Remove',
                                    'action': removeModel,
                                };
                            }
                            return result;
                        }
                    },
                    type: {
                        "types": {
                            "main": {
                                "icon": {
                                    "image": "../favicon.ico",
                                },
                            },
                            "camera": {
                                "icon": {
                                    "image": "../gui/images/camera-anim.gif",
                                },
                            },
                            "children": {
                                "icon": {
                                    "image": "../gui/images/folder.png",
                                },
                            },
                            "local": {
                                "icon": {
                                    "image": "../gui/images/Photoshop3DAxis.png",
                                },
                            },
                            "geometry": {
                                "icon": {
                                    "image": "../gui/images/geometry.png",
                                },
                            },
                            "sub": {
                                "icon": {
                                    "image": "../gui/images/folder.png",
                                },
                            },
                            "child": {
                                "icon": {
                                    "image": "../gui/images/folder.png",
                                },
                            },
                            "empty": {
                                "icon": {
                                    "image": "../gui/images/cross.jpg",
                                },
                            },
                            "material": {
                                "icon": {
                                    "image": "../gui/images/material.png",
                                },
                            },
                            "camera_child": {
                                "icon": {
                                    "image": "../gui/images/camera.png",
                                },
                            },
                        }
                    },
                    themes: {
                        "theme": "apple",
                    },
                });

                // treeScene.Tree.bind(
                // "select_node.jstree", function(evt, data){
                //     var tmp = data.inst.get_json()[0];
                //     if(tmp.attr.hasOwnProperty("id")){
                //         var id = tmp.attr.id.split("__").pop();
                //         if(viewer.pickName[id]!="undefined"&&viewer.pickName[id]!=null){
                //                 if (!viewer.channel.selected) viewer.channel.selected = {};
                //                 if (viewer.channel.selected[id]) {
                //                     delete viewer.channel.selected[id];
                //                     window.fl4reStatus("",$("#mainLayout-south"),"selected "+viewer.pickName[Object.keys(viewer.channel.selected)[0]]);
                //                 } else {
                //                     viewer.channel.selected[id] = true;
                //                     window.fl4reStatus("",$("#mainLayout-south"),"selected "+viewer.pickName[id]);
                //                 }  
                //             } else{ 
                //                 window.fl4reStatus("READY",$("#mainLayout-south"));
                //                 delete viewer.channel.selected;
                //             }
                //             viewer.draw();
                //         }
                //     });

                window.callbacks = function () {
                    setTimeout(function () {
                        function display(array, index) {
                            var id = array[index].id;
                            var value = array[index].value;
                            var elem = $("#" + id);
                            elem.click(function () {
                                console.debug(id + " |")
                                console.debug(value)
                            });
                            if (value !== undefined && typeof (value) !== 'object') elem.append("<a style='float:right'>" + value + "</a>");
                        }

                        function local(array, index) {
                            var id = array[index].id;
                            var value = array[index].value;
                            $("#" + id).click(function () {
                                var tmp = trs.create();
                                trs.fromMat4(tmp, value);
                                var e = euler.create();
                                euler.fromQuat(e, tmp.rotation);
                                console.debug("translation", tmp.translation);
                                console.debug("scale", tmp.scale);
                                console.debug("rotation", e);
                                var html = "<div id='infplay" + id + "'></div>";
                                GUI.notification({
                                    title: id,
                                    text: html,
                                    type: "notice",
                                });
                                html = $("#infplay" + id);

                                function createSliders(parent, type, element) {
                                    switch (type) {
                                    case "Translation":
                                        var min = -1000,
                                            max = 1000,
                                            step = 1;
                                        break;
                                    case "Scale":
                                        var min = 0.1,
                                            max = 1,
                                            step = 0.05;
                                        break;
                                    case "Rotation":
                                        var min = -5,
                                            max = 5,
                                            step = 0.1;
                                        break;
                                    }
                                    var callback = function (element) {
                                            switch (type) {
                                            case "Translation":
                                                decodeAndPush(element, e, tmp.scale);
                                                break;
                                            case "Scale":
                                                decodeAndPush(tmp.translation, e, element);
                                                break;
                                            case "Rotation":
                                                decodeAndPush(tmp.translation, element, tmp.scale);
                                                break;
                                            }
                                        }
                                    parent.append("<a>" + type + "</a><br>")
                                    var title = $("<a>X: " + element[0] + "</a>");
                                    parent.append(title);
                                    var tmp1 = GUI.addSlider(type + "X_" + id, html, min, max, step, element[0]);
                                    tmp1.on("slide", function () {
                                        var result = $(this).slider("value");
                                        title.text("X: " + result);
                                        element[0] = result;
                                        callback(element);
                                    })
                                    var title1 = $("<a>Y: " + element[1] + "</a>");
                                    parent.append(title1);
                                    var tmp2 = GUI.addSlider(type + "Y_" + id, html, min, max, step, element[1]);
                                    tmp2.on("slide", function () {
                                        var result = $(this).slider("value");
                                        title1.text("Y: " + result);
                                        element[1] = result;
                                        callback(element);
                                    })
                                    var title2 = $("<a>Z: " + element[2] + "</a>");
                                    parent.append(title2);
                                    var tmp3 = GUI.addSlider(type + "Z_" + id, html, min, max, step, element[2]);
                                    tmp3.on("slide", function () {
                                        var result = $(this).slider("value");
                                        title2.text("Z: " + result);
                                        element[2] = result;
                                        callback(element);
                                    })
                                }
                                createSliders($(html), "Translation", tmp.translation);
                                createSliders($(html), "Rotation", e);
                                createSliders($(html), "Scale", tmp.scale);

                                function decodeAndPush(trans, rot, scale) {
                                    var q = quat.create();
                                    quat.fromEuler(q, rot);
                                    var trs1 = trs.fromValues(trans, q, scale);
                                    var mat1 = mat4.create();
                                    mat4.fromTrs(mat1, trs1);
                                    array[index].parent[array[index].type] = mat1;
                                    viewer.draw();
                                }
                            });

                            //TEST DECODE/ENCODE ALGO WORKS
                            // $("#"+id).click(function(){
                            //     console.debug("input",value);
                            //     var tmp = trs.create();
                            //     trs.fromMat4(tmp, value);
                            //     var e = euler.create();
                            //     euler.fromQuat(e,tmp.rotation);
                            //     console.debug("translation",tmp.translation);
                            //     console.debug("scale",tmp.scale);
                            //     console.debug("rotation",e);

                            //     var q = quat.create();
                            //     quat.fromEuler(q,e);
                            //     console.debug(q);

                            //     var trs1 = trs.fromValues(tmp.translation,q,tmp.scale);
                            //     var mat1 = mat4.create();
                            //     mat4.fromTrs(mat1,trs1);
                            //     console.debug("output",mat1);
                            // });
                        }
                        for (var g = 0; g < callbackArray.length; g++) {
                            var setValue = function (value) {
                                return callbackArray[g].parent[callbackArray[g].type] = value;
                            };
                            if (callbackArray[g].type == "local") {
                                local(callbackArray, g)
                            }
                            else {
                                display(callbackArray, g);
                            }
                        }
                    }, 500);
                }
            }
            viewer.onload = refreshScenesTree;
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            //---------- SCRIPT tab --------------------------------------------------------------------------------------

            renderMenu.addTab({
                id: "script",
                text: "  Script"
            });

            var sample = "$('body').keypress(\n  function(e){\n  if (e.keyCode==113){\n//if key 'q' \n console.debug(e.keyCode)\n  //tape your code here \n } \n});";

            var script = GUI.script({
                id: "scriptArea",
                parent: renderMenu.script,
                content: sample
            });

            renderMenu.script.append("<br><hr></br>");

            script.object.setSize("100%", "93%");
            renderMenu.refresh();

            var play;
            var stop;
            var clear;
            var help;
            var save;
            var load;

            GUI.image(renderMenu.script.title, "img-script", "../gui/images/script.png", 20, 14, "before");
            play = GUI.button("Play", renderMenu.script, function () {
                window.runStatus();
                window.interprate();
                script.parent.on('keyup', function () {
                    window.interprate();
                })
                play.addClass("disablehide");
                stop.removeClass("disablehide");
                clear.addClass("disablehide");
                flagStatus = true;
                if (CONSOLE.flagError) {
                    CONSOLE.flagError = false;
                    window.errorStatus();
                }
            });
            play.html('');
            GUI.addIcon(play, "ui-icon-play", "", "before");
            GUI.addTooltip({
                parent: play,
                content: "Run script"
            });
            stop = GUI.button("Stop", renderMenu.script, function () {
                script.parent.off();
                play.removeClass("disablehide");
                stop.addClass("disablehide");
                clear.removeClass("disablehide");
                flagStatus = false;
                window.readyStatus();
            });
            stop.addClass("disablehide");
            stop.html('');
            GUI.addIcon(stop, "ui-icon-stop", "", "before");
            GUI.addTooltip({
                parent: stop,
                content: "Stop script"
            });
            clear = GUI.button("Clear", renderMenu.script, function () {
                script.parent.off();
                script.object.setValue(sample);
                script.object.clearHistory();
                window.readyStatus();
                flagStatus = false;
            });
            clear.html('');
            GUI.addIcon(clear, "ui-icon-trash", "", "before");
            GUI.addTooltip({
                parent: clear,
                content: "Clear script"
            });
            help = GUI.button("Help", renderMenu.script, function () {
                var html = "<dl><dt>Ctrl-F / Cmd-F</dt><dd>Start searching</dd><dt>Ctrl-G / Cmd-G</dt><dd>Find next</dd><dt>Shift-Ctrl-G / Shift-Cmd-G</dt><dd>Find previous</dd><dt>Shift-Ctrl-F / Cmd-Option-F</dt><dd>Replace</dd> <dt>Shift-Ctrl-R / Shift-Cmd-Option-F</dt><dd>Replace all</dd><dt>Ctrl-Space / Cmd-Space</dt><dd>Auto-complete</dd></dl>"
                GUI.notification({
                    title: "Script hotkeys",
                    text: html,
                    type: "notice"
                })
            });
            help.html('');
            help.prop('id', "helpScript");
            GUI.addIcon(help, "ui-icon-note", "", "before");
            GUI.addTooltip({
                parent: help,
                content: "Hotkeys"
            });

            save = GUI.button("Save", renderMenu.script, function () {

            })
            save.html('');
            save.prop('id', "saveScript");
            GUI.addIcon(save, "ui-icon-disk", "", "before");
            GUI.addTooltip({
                parent: save,
                content: "Save current script"
            });

            var loadInput = GUI.input({
                id: "loadScript",
                parent: renderMenu.script,
                hide: true,
                extension: "application/javascript",
                mode: "readText",
                callback: function (FILE) {
                    script.object.setValue(FILE.target.result);
                    GUI.notification({
                        text: "Script loaded",
                        time: "5000",
                        type: "notice"
                    });
                }
            });
            load = GUI.button("Load", renderMenu.script, function () {
                loadInput.click();
                script.refresh();
            });
            load.html('');
            GUI.addIcon(load, "ui-icon-folder-open", "", "before");
            GUI.addTooltip({
                parent: load,
                content: "Load script"
            });

            var runStatus = GUI.image(renderMenu.script, "traffic-light", "../gui/images/traffic-cone_blue.png", '20', '20');
            GUI.addTooltip({
                parent: runStatus,
                content: "Ready to run"
            })


            window.interprate = function () {
                //$('body').unbind();
                // $(document).unbind();
                window.runStatus();
                $('#scriptElement').remove();
                $('#scriptElement').empty();
                $('#scriptElement').html('');
                var js = script.object.getValue();
                var variable = document.createElement('script');
                variable.id = 'scriptElement';
                variable.textContent = js;
                document.body.appendChild(variable);
                if (CONSOLE.flagError) {
                    CONSOLE.flagError = false;
                    window.errorStatus();
                }
            }

            window.readyStatus = function () {
                runStatus.remove();
                runStatus = GUI.image(renderMenu.script, "traffic-light", "../gui/images/traffic-cone_blue.png", '20', '20');
                GUI.addTooltip({
                    parent: runStatus,
                    content: "Ready to run"
                })
            }

            window.errorStatus = function () {
                runStatus.remove();
                runStatus = GUI.image(renderMenu.script, "traffic-light", "../gui/images/traffic-cone_red.png", '20', '20');
                GUI.addTooltip({
                    parent: runStatus,
                    content: "Error detected into the script, please consult the console"
                });
            }

            window.runStatus = function () {
                runStatus.remove();
                runStatus = GUI.image(renderMenu.script, "traffic-light", "../gui/images/traffic-cone_green.png", '20', '20');
                GUI.addTooltip({
                    parent: runStatus,
                    content: "Running..."
                });
            }




            /////////////// VIEWER WEBGL WORKAROUD ///////////////////////////////////////////////



            function jumpLine() {
                renderMenu.render.append("<br></br>");
            }

            jumpLine();

            // renderMenu.render.append("<h4>Welcome to rest3d's viewer!</h4>");
            var accordionUp = GUI.accordion({
                id: "Upload",
                parent: renderMenu.render,
                item: [{
                    id: "upload",
                    text: "Upload"
                }]
            })
            accordionUp.upload.header.click();

            var upload = {
                parent: accordionUp.upload,
                id: "upModel",
                url: location.protocol + "//" + location.host + '/rest3d/tmp/',
                idUser: viewer.idUser
            };
            upload = setViewer6Upload($, upload, rest3d, viewer);
             upload.progress.progress_upModel.width("100%");


            jumpLine();

            var accordion = GUI.accordion({
                id: "menu-render",
                parent: renderMenu.render,
                item: [{
                    id: "collada",
                    text: ""
                }, {
                    id: "gltf",
                    text: ""
                }, ]
            })
            accordion.autoScrollDown();
            GUI.image(accordion.collada.header, "img-settings", "../gui/images/collada.png", 40, 80, "before");
            GUI.image(accordion.gltf.header, "img-settissngs1", "../gui/images/glTF.png", 40, 35, "before");
            GUI.image(renderMenu.render.title, "img-render", "../gui/images/menu-render.png", 12, 14, "before");
            GUI.image(renderMenu.scenes.title, "img-render", "../gui/images/scene-root.png", 12, 14, "before");
            // accordion.collada.header.append()

            jumpLine();

            window.notif = function (object) {
                win.parent().parent().find(".ui-icon-close").click();
                win.remove();
                GUI.notification({
                    title: object + " successfuly loaded",
                    text: "<div id='informationDisplay'></div>",
                    type: "notice",
                });
                win = $('#informationDisplay');
                GUI.label("zoom", "currentZoom is 1", win);
                win.append('</br>');
                GUI.label('rot', 'rotation goes here', win);
                win.append('</br>');
                GUI.label('loadtimer', 'loading time: 0', win);
                win.append('</br>');
                GUI.label('rdm1', 'Initializing canvas mouse events', win);
                win.append('</br>');
                GUI.label('rdm12', 'Use left mouse click to rotate', win);
                win.append('</br>');
                GUI.label('rdm13', 'Use mouse wheel to zoom', win);
            }

            GUI.button('cat skinned (work in progress)', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/cat/cat-skin.dae";
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    }, function (error) {
                        // If there's an error or a non-200 status code, log the error.
                        console.error("cs " + error);
                    });
            }).width("90%");
            accordion.collada.append("<hr></hr>");

            GUI.button('cat skinned', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/cat/cat-skin.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.gltf.append("<hr></hr>");


            GUI.button('gradient', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/gradient/gradient.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.gltf.append("<hr></hr>");


            GUI.button('duck', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/duck/duck.dae"
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    }, function (error) {
                        // If there's an error or a non-200 status code, log the error.
                        pleaseWait(false);
                        console.error("cs " + error);
                    });
            }).width("90%");
            accordion.collada.append("<hr></hr>");

            GUI.button('creature', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/Amahani/Amahani.dae";
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.collada.append("<hr></hr>");

            GUI.button('skinned creature (fix me!!)', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/Amahani/Amahani.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.gltf.append("<hr></hr>");

            GUI.button('duck', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/duck-glft/duck_triangulate.json"
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.gltf.append("<hr></hr>");

            GUI.button('rambler', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/rambler/Rambler.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })

            }).width("90%");
            accordion.gltf.append("<hr></hr>");

            GUI.button('rambler-min', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/rambler/Rambler-min.dae";
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })

            }).width("90%");
            accordion.collada.append("<hr></hr>");

            GUI.button('rambler', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/rambler/Rambler.dae";
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.collada.append("<hr></hr>");

            GUI.button('supermurdoch', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/SuperMurdoch/SuperMurdoch.dae";
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.collada.append("<hr></hr>");

            GUI.button('supermurdoch', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/SuperMurdoch/SuperMurdoch.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.gltf.append("<hr></hr>");

            GUI.button('wine', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/wine/wine.dae";
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.collada.append("<hr></hr>");

            GUI.button('wine', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/wine/wine.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.gltf.append("<hr></hr>");


            GUI.button('uh-1n', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/uh-1n/uh-1n.dae"
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.collada.append("<hr></hr>");

            GUI.button('uh-1n', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/uh-1n/uh-1n.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");
            accordion.gltf.append("<hr></hr>");

            GUI.button('cow', accordion.collada, function () {
                pleaseWait(true);
                var url = "/models/cow/cow.dae"
                COLLADA.load(url, viewer.parse_dae).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");

            GUI.button('cow', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/cow/cow.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");


            GUI.button('cat skinned + animation (fix me!', accordion.gltf, function () {
                pleaseWait(true);
                var url = "/models/cat/20_cat_smooth_bake_channel.json";
                glTF.load(url, viewer.parse_gltf).then(
                    function (flag) {
                        pleaseWait(false);
                        window.notif(url);
                    })
            }).width("90%");

            var canvas = GUI.canvas(layout.jqueryObjectWest);
            // layout.resetOverflow('west');

            // initialize webGL
            viewer.channel = Channel.create(canvas, false); // true for debug context

            var button1 = GUI.button('Simulate Context Loss', renderMenu.render, function () {
                if ($(this).find('.ui-button-text').text() == "Simulate Context Loss") {
                    Channel.forceContextLoss();
                    $(this).find('.ui-button-text').text("Simulate Restore Context");
                }
                else {
                    Channel.forceContextRestore();
                    $(this).find('.ui-button-text').text("Simulate Context Loss");
                }
            });
            initCanvasUI();

            // var currentZoom =0;
            // var currentRotationX, currentRotationY = 0;

            function initCanvasUI() {
                var mouseDown = false;
                var lastX, lastY = 0;
                var downX, downY = 0;
                // attach mouse events to canvas

                function mouseDownHandler(ev) {
                    if (!mouseDown) {
                        mouseDown = true;
                        downX = ev.screenX;
                        downY = ev.screenY;
                    }
                    lastX = ev.screenX;
                    lastY = ev.screenY;

                    return true;
                }

                function mouseMoveHandler(ev) {
                    if (!mouseDown) return false;

                    viewer.currentZoom = 1;
                    var mdelta = ev.screenX - lastX;
                    lastX = ev.screenX;
                    viewer.currentRotationX -= mdelta / 2.5;


                    var mdelta = ev.screenY - lastY;
                    lastY = ev.screenY;
                    viewer.currentRotationY += mdelta / 2.5;


                    viewer.draw();
                    return true;
                }

                function mouseUpHandler(ev) {
                    mouseDown = false;
                    viewer.currentZoom = 1;
                    // pick
                    if ((downX === ev.screenX) && (downY === ev.screenY)) {

                        var x = ev.layerX / ev.currentTarget.clientWidth;
                        var y = 1.0 - (ev.layerY / ev.currentTarget.clientHeight);

                        var id = viewer.pick(x, y);

                        if (viewer.pickName[id] != "undefined" && viewer.pickName[id] != null) {
                            if (!viewer.channel.selected) viewer.channel.selected = {};
                            if (viewer.channel.selected[id]) {
                                delete viewer.channel.selected[id];
                                window.fl4reStatus("", $("#mainLayout-south"), "selected " + viewer.pickName[Object.keys(viewer.channel.selected)[0]]);
                            }
                            else {
                                var realId = viewer.pickName[id].split("#").pop();
                                realId = realId.split("[")[0];
                                // console.debug("#"+realId+'__'+id+' '+$("#"+realId+'__'+id).length);
                                treeScene.Tree.jstree("select_node", "#" + realId + '__' + id);
                                viewer.channel.selected[id] = true;
                                window.fl4reStatus("", $("#mainLayout-south"), "selected " + viewer.pickName[id]);
                            }
                        }
                        else {
                            window.fl4reStatus("READY", $("#mainLayout-south"));
                            if (treeScene) {
                                treeScene.Tree.jstree("deselect_all");
                            }
                            delete viewer.channel.selected;
                        }
                        viewer.draw();
                    }
                }

                function mouseWheelHandler(ev) {

                    var mdelta = ev.wheelDelta;
                    viewer.currentZoom = Math.exp(mdelta / 2500);

                    viewer.draw();
                    return true;
                }

                canvas.removeEventListener("mousedown", mouseDownHandler, false);
                canvas.removeEventListener("mousemove", mouseMoveHandler, false);
                canvas.removeEventListener("mouseup", mouseUpHandler, false);
                canvas.removeEventListener("mousewheel", mouseWheelHandler, false);
                canvas.addEventListener("mousedown", mouseDownHandler, false);
                canvas.addEventListener("mousemove", mouseMoveHandler, false);
                canvas.addEventListener("mouseup", mouseUpHandler, false);
                canvas.addEventListener("mousewheel", mouseWheelHandler, false);

                function touchHandler(event) {
                    var touches = event.changedTouches,
                        first = touches[0],
                        type = "";
                    switch (event.type) {
                    case "touchstart":
                        type = "mousedown";
                        break;
                    case "touchmove":
                        type = "mousemove";
                        break;
                    case "touchend":
                        type = "mouseup";
                        break;
                    default:
                        return;
                    }

                    //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
                    //           screenX, screenY, clientX, clientY, ctrlKey, 
                    //           altKey, shiftKey, metaKey, button, relatedTarget);

                    var simulatedEvent = document.createEvent("MouseEvent");
                    simulatedEvent.initMouseEvent(type, true, true, window, 1,
                        first.screenX, first.screenY,
                        first.clientX, first.clientY, false,
                        false, false, false, 0 /*left*/ , null);

                    first.target.dispatchEvent(simulatedEvent);
                    event.preventDefault();
                }


                canvas.addEventListener("touchstart", touchHandler, true);
                canvas.addEventListener("touchmove", touchHandler, true);
                canvas.addEventListener("touchend", touchHandler, true);
                canvas.addEventListener("touchcancel", touchHandler, true);


                // redraw on resize

                $(canvas).resize(function (evt) {
                    viewer.draw();
                });
            };

            button1.hide();

            setTimeout(function () {
                layout.jqueryObject.sizePane("west", $(window).width() - 549);
            }, 1000);

            layout.jqueryObject.resizeAll();
            layout.jqueryObject.initContent("center");
            layout.jqueryObject.initContent("west");

            window.loadCss("hot-sneaks");

            // $("#mainLayout-west").append('<div id="colorSelector"  style="z-index:9999!important;"><div style="background-color: #0000ff"></div></div>');
            GUI.button("undefined", $("#mainLayout-west")).prop("id", "colorSelector");
            var tmpPicker;
            var flagColorPicker = 'show';
            $('#colorSelector div').css('backgroundColor', '#ffffff');

            $('#colorSelector').ColorPicker({
                color: '#ffffff',
                onShow: function (colpkr) {
                    $(".colorpicker").css("margin-left", "-320px");
                    $(colpkr).fadeIn(200);
                    tmpPicker = $(colpkr);
                    return false;
                },
                onHide: function (colpkr) {
                    $(colpkr).fadeOut(200);
                    tmpPicker = $(colpkr);
                    return false;
                },
                onSubmit: function (hsb, hex, rgb) {
                    $('#colorSelector div').css('backgroundColor', '#' + hex);
                    $('#mainLayout-west').css('backgroundColor', '#' + hex);
                    $("#mainLayout-west").css({
                        "background-image": "none"
                    });
                    tmpPicker.fadeOut(200);
                }
            });
            // $("#tmp, #colorSelector, .colorpicker").mouseover(function(){
            //     $('#colorSelector').show();
            // })
            //   $("#tmp, #colorSelector, .colorpicker").mouseleave(function(){
            //     $('#colorSelector').hide();
            // })


            var settingMenu = GUI.menu({
                id: "settings-menu",
                parent: menu.settings,
                item: [{
                    id: "contextLoss",
                    text: 'Context Loss',
                    callback: function () {
                        button1.click();
                    }
                }, {
                    type: "separator"
                }, {
                    id: "animationFrame",
                    type: "checkbox",
                    text: "Request Animation Frame",
                    isChecked: function () {
                        $("#fpsCounterSetting").removeClass("disable");
                        viewer.flagTick = true;
                        viewer.tick();
                    },
                    noChecked: function () {
                        $("#fpsCounterSetting").addClass("disable");
                        if ($('#fpsCounterSetting').find('input').prop("checked") == true) {
                            $('#fpsCounterSetting').find('input').attr("checked", false);
                            $("#fps").hide();
                        }
                        viewer.flagTick = false;
                    }
                }, {
                    id: "fpsCounterSetting",
                    type: "checkbox",
                    text: "Show fps counter",
                    isChecked: function () {
                        $("#fps").show();
                    },
                    noChecked: function () {
                        $("#fps").hide();
                    },
                }, ]
            });


            var htmlFps = '<div class="yasuo" style="z-index: 999 !important;"><a id="fps" class="ui-widget-content" style="float:right;" >? FPS</a></div>';
            $("#mainLayout-west").append(htmlFps);

            var but1 = GUI.button('fullscreen', $("#mainLayout-west"), function () {
                if (screenfull.enabled) {
                    screenfull.request($("#mainLayout-west")[0]);
                }
            }).prop("id", "fullCanvas");
            but1.html('');
            GUI.addIcon(but1, "ui-icon-arrow-4-diag", "", "before");
            GUI.addTooltip({
                parent: but1,
                content: "Fullscreen mode",
            });
            $('#colorSelector').html('');
            GUI.addIcon($('#colorSelector'), "ui-icon-key", "", "before");
            GUI.addTooltip({
                parent: $('#colorSelector'),
                content: "Set a color to the background",
            });
            $('#colorSelector').css({
                "background": "none !important;"
            })
            var inputImage = GUI.input({
                id: "loadImage",
                parent: renderMenu.script,
                hide: true,
                extension: "image/*",
                mode: "displayImage",
            });
            var button = GUI.button('', $("#mainLayout-west"), function () {
                inputImage.click();
            }).prop("id", "imageCanvas");
            button.html('');
            GUI.addIcon(button, "ui-icon-image", "", "before");
            GUI.addTooltip({
                parent: button,
                content: "Load an image as background",
            });
            /// Temporary welcome panel, keep code please
            function welcomePanel() {
                $("#dialog").dialog("close");
                var gitHtml = $('<div id="dialog"><img src="../gui/images/loading.gif"/></div>');
                gitPanel = $('body').append(gitHtml);

                function header(html, parent, text, draggableFlag, visibleFlag, button) {
                    this.flag = true;
                    this.html = html;
                    this.text = text;
                    this.parent = parent;
                    this.draggableFlag = draggableFlag;
                    this.visibleFlag = visibleFlag;
                    this.button = button;
                    this.createDraggable = function (flag) {
                        this.draggableZone = $('<div class="draggableWelcome ui-widget-header" style="display:inline-block"></div>');
                        this.header = this.header.append(this.draggableZone);
                        this.draggableZone.width("100%").height(71);
                        if(this.text=="Description&Features"){
                            var plus = $('<div style="float:right;margin-top:12px;margin-right:10px;"></div>');
                            this.draggableZone.append(plus);
                            GUI.image(plus, "img-welcome", "../gui/images/green-plus.png", 70, 40, "before");
                            GUI.addTooltip({
                                parent: plus,
                                content: "Add your own features",
                            });
                            plus.click(function(){
                                GUI.messageDialog("yes","","Not yet implemented") 
                            })
                        }
                    }
                    this.createHeader = function () {
                        this.header = $("<div></div>");
                        this.linkArea = $("<div style = 'display:inline;'></div>");
                        this.link = $("<a style='float:right;'  href='#'>+" + this.text + "</a>");
                        // else{this.button="";}
                        this.parent.append(this.header)
                        if (this.button) {
                            this.button = $("<a style='float:left;'  href='#'>" + this.button + "</a>");
                            this.linkArea.append(this.button)
                        }
                        this.parent.append(this.linkArea, '<br><hr>');
                        this.linkArea.append(this.link);
                        this.header.append(this.html, "<br></br>");
                        this.header.css({
                            "text-align": "justify",
                            "text-justify": "inter-word"
                        })
                        this.header.hide();
                    }
                    this.createButton = function (name, data) {
                        var button = GUI.button("", this.draggableZone)
                        if (name == "") {
                            // button.prop('disabled', true);
                            var link = "../gui/images/upload_d.png";
                            GUI.addTooltip({
                                parent: button,
                                content: "This is your own temporary repository hosted by our cloud and used for linking node/the database",
                            });
                        }
                        else {
                            var link = data[name].picture;
                            GUI.addTooltip({
                                parent: button,
                                content: data[name].description,
                            });
                            button.data(data[name]);
                        }
                        // button.width(55).height(66);
                      
                        if(link=="../gui/images/exist.png"){
                            GUI.image(button, "img-welcome", link, 90, 54, "before");
                        }else{
                              GUI.image(button, "img-welcome", link, 77, 57, "before");
                        }
                        // button.width(57).height(77);
                        // button.height(85.781)
                        return button;
                    }
                    this.change = function () {
                        if (this.flag == true) {
                            this.header.show();
                            if (this.button) this.button.show();
                            this.link[0].innerText = "-" + this.text;
                            this.flag = false;
                        }
                        else {
                            this.header.hide();
                            if (this.button) this.button.hide();
                            this.link[0].innerText = "+" + this.text;
                            this.flag = true;
                        }
                    }
                    this.addDraggable = function () {
                        this.createDraggable();
                    }
                    this.createHeader();
                    var stock = this;
                    this.link.on("click", function () {
                        stock.change();
                    });
                    if (this.draggableFlag) {
                        this.addDraggable();
                        if (this.visibleFlag) {
                            this.link.click();
                        }
                    }
                }

                var setDraggable = function (object, drop, zone) {
                    object.draggable({
                        revert: "invalid",
                        cancel: false
                    });
                    drop.droppable({
                        activeClass: "ui-state-default",
                        hoverClass: "ui-state-hover",
                        drop: function (event, ui) {
                            var position = drop.find("button").last().position();
                            if (position == undefined) {
                                position = {
                                    "top": 84.5,
                                    "left": -50
                                };
                            }
                            drop.append(ui.draggable);
                            ui.draggable.css({
                                position: "absolute",
                                top: position.top,
                                left: position.left + 63
                            });
                            var json = ui.draggable.data();
                            if (!viewer.databases.hasOwnProperty(json.name)) {
                                viewer.databases[json.name] = json
                            }
                            else {
                                delete viewer.databases[json.name];
                            }
                            // object.remove(); 
                            // object.draggable("destroy");
                            // drop.droppable("destroy");
                            setDraggable(ui.draggable, zone, drop);
                        }
                    });
                }

                var callback = function (data) {
                    data = jQuery.parseJSON(data);
                    gitHtml.find("img").replaceWith("");
                    var what = "<a>We are proposing a new version of our viewer elaborated with gui6. In addition of the basic functionnalites available in the last version, you are now able to display some model samples in COLLADA/glTF format, convert a COLLADA object to glTF and edit a scene. You can either explore some solutions listed below for editing models hosted by their databases, upload your models to your own project stocked in our cloud or just work statically.";
                    what = new header(what, gitHtml, "Description&Features", true, true);
                    var guest = "<a>This section is dedicated to users who wants to fastly use our application. The user session will be automatically removed once expired. Drag and drop the features you want to exploit and get started!</a>";
                    guest = new header(guest, gitHtml, "Guest account", true, true, "Get started!");
                    guest.createButton("", data);
                    var login = "<a>OAuth authentification not yet implemented</a>";
                    login = new header(login, gitHtml, "Login via google", false, false);
                    var about = "<a>AMD is sponsoring the main open-source (MIT licensed) prototype. It is a turn-key rest3d server composed of a XML database, a nodejs rest server, and viewer/loader code for the client. Source code available at https://github.com/amd/rest3d </a>";
                    about = new header(about, gitHtml, "About", false, false);
                    if (data.hasOwnProperty("dvia")) {
                        // tmp.prop("disabled",true)
                        // tmp.find('button').css({"pointer-events":"none"})
                        setDraggable(what.createButton("dvia", data), guest.draggableZone, what.draggableZone);
                    }
                    if (data.hasOwnProperty("warehouse")) {
                        setDraggable(what.createButton("warehouse", data), guest.draggableZone, what.draggableZone);
                    }
                    if(data.hasOwnProperty("db")){
                        setDraggable(what.createButton("db", data), guest.draggableZone, what.draggableZone);
                    }
                    guest.button.click(function () {
                        $("#dialog").dialog("close");
                        window.renderMenu = renderMenu;
                        if (viewer.databases.hasOwnProperty("warehouse")) {
                            require(["database"], function (databaseTab) {
                                var tmp = new databaseTab(viewer.databases.warehouse);
                            });
                        }
                        if (viewer.databases.hasOwnProperty("3dvia")) {
                            require(["database"], function (databaseTab) {
                                var tmp = new databaseTab(viewer.databases["3dvia"]);
                            });
                        }
                       if (data.hasOwnProperty("db")) {
                            require(["database"], function (databaseTab) {
                                console.debug(data.db)
                                var tmp = new databaseTab(data.db);
                            });
                        }
                    })
                }

                $("#dialog").dialog({
                    width: '500',
                    height: 'auto',
                    position: ['middle', 20],
                    title: 'Welcome to rest3d!',
                    modal: true,
                    create: function () {
                        $(this).css("maxHeight", 450);
                    },
                    open: function (ev, ui) {
                        rest3d.info(callback);
                    },
                    close: function () {
                        gitHtml.remove();
                    },
                });

            }
            viewer.fpsCounter = new viewer.FPSCounter();
            viewer.flagTick = false;
            viewer.fpsCounter.createElement(document.getElementById("fps"));
            viewer.fpsCounter.run();
            $("#fps").hide();
            viewer.tick();

            window.fl4reStatus("READY", $("#mainLayout-south"));
            GUI.container.resizeAll();
            GUI.container.initContent("center");
            GUI.container.initContent("west");

            rest3d.tmp("",function (data) {
                data = jQuery.parseJSON(data);
                if (jQuery.isEmptyObject(data.children) && jQuery.isEmptyObject(data.assets)) {
                    welcomePanel();
                }
                else {
                    rest3d.info(function (data) {
                        window.renderMenu = renderMenu;
                        data = jQuery.parseJSON(data);
                        if (data.hasOwnProperty("warehouse")) {
                            require(["database"], function (databaseTab) {
                                var tmp = new databaseTab(data.warehouse);
                            });
                        }
                        if (data.hasOwnProperty("dvia")) {
                            require(["database"], function (databaseTab) {
                                var tmp = new databaseTab(data.dvia);
                            });
                        }
                        if (data.hasOwnProperty("db")) {
                            require(["database"], function (databaseTab) {
                                var tmp = new databaseTab(data.db);
                            });
                        }
                    })
                var tmp = new parseREST3D();
                tmp.loop(data,$('#c_'+viewer.idUser));
                }
                //welcomePanel();
                setTimeout(function(){$("#uploadTree").jstree('open_all');},1500);
             // TAB API NEED TO BE IMPROVED
            });
            var parseREST3D = function(){
                this.loop = function(data,parent,flag){
                    var stock = this;
                    var origin = parent;
                    for(var key in data.assets){
                        parent = origin;
                        var uuid = data.assets[key];
                        var tmp = key.split("/");
                        var flag2 = false;
                        for(var i=0;i<tmp.length;i++){
                            if(i !== tmp.length - 1){  
                                parent = stock.createNode({"name":tmp[i],"collectionpath":parent.attr('collectionpath')},parent);
                                if(!flag2){flag2=tmp[i];}
                                else{
                                    flag2 += "/"+tmp[i]; 
                                }
                                flag=true;                        
                            }
                            else{
                                var json = {"name":tmp[i], "uuid":uuid, "collectionpath":"", "assetpath":""};
                                if(flag){
                                    json.collectionpath = parent.attr('collectionpath');
                                }
                                if(flag2){
                                    json.assetpath = flag2;
                                }
                                stock.createNodeDatabase(json,parent);
                            }
                        }
                    }
                    for(var key1 in data.children){
                        var uuid = data.children[key1];
                        rest3d.tmp({key:key1,parent:parent},function(data){
                            stock.loop(jQuery.parseJSON(data.data),stock.createCollection({"collectionpath":data.key},data.parent),true);
                        },uuid)
                    }
                }
                this.createNodeDatabase=function(file, parent) { //upload.createNodeDatabase file.name file.uuid file.collectionpath file.assetpath parent
                    var stock = this;
                    console.debug(file);
                    if(file.hasOwnProperty('path')){
                        var path = file.path;
                    }
                    else{
                        var path="";
                        if(!file.collectionpath==""){
                            path += "/"+file.collectionpath;
                        }
                        if(!file.assetpath==""){
                            path += "/" + file.assetpath;
                        }
                        path +="/" + file.name;
                    }
                    var json = {
                        "data": file.name,
                        "attr": {
                            "id": "a_" + file.uuid,
                            "name": file.name,
                            "path": path,
                            "collectionpath": file.collectionpath,
                            "assetpath": file.assetpath,
                            "rel": upload.extensionToType(file.name.match(/\.[^.]+$/)[0]),
                            "uploadstatus": true,
                        }
                    }
                    if(file.collectionpath==""&&file.assetpath==""&&parent.attr("id")=="c_"+stock.idUser){
                        console.debug(parent.attr("id"))
                        delete json.attr.collectionpath;
                        delete json.attr.assetpath;
                        json.attr.path = file.name;
                    }
                    $("#uploadTree").jstree("create_node", parent, "inside", json, false, true);
                    file.idToTarget = "#a_" + file.uuid
                    if(file.hasOwnProperty("size"))
                    {
                        GUI.addTooltip({
                            parent: $("#a_" + file.uuid),
                            content: "size: " + file.size,
                            //wait new tooltip for showing date + User fields
                        });
                    }
                    return $(file.idToTarget);
                }
                this.createNode = function(file,parent){
                    var id = upload.encodeStringToId(file.name+"_"+Math.floor(Math.random() * 100000) + 1);
                    var json = {
                            "data": file.name,
                            "attr": {
                                "id": id,
                                "rel": "collection",
                                "uploadstatus": true,
                            }
                        }
                    if(file.hasOwnProperty('assetpath')){
                        if(file.assetpath!==""){
                            json.attr.assetpath=file.assetpath;
                        }
                    }
                     if(file.hasOwnProperty('collectionpath')){
                        if(file.collectionpath!==""){
                            json.attr.collectionpath = file.collectionpath;
                        }
                    }
                    $("#uploadTree").jstree("create_node", parent, "inside",json, false, true);
                    return $("#"+id);
                }
                this.createCollection =  function(file, parent) {
                    var id = upload.encodeStringToId(file.collectionpath);
                    parent.data({});
                    console.debug(parent);
                    if (!parent.data().hasOwnProperty(file.collectionpath)) {
                        var flagCollection = {};
                        flagCollection[file.collectionpath] = true;
                        parent.data(flagCollection);
                        $("#uploadTree").jstree("create_node", parent, "inside", {
                            "data": file.collectionpath,
                            "attr": {
                                "id": id,
                                "collectionpath": file.collectionpath,
                                "rel": "collection",
                                "uploadstatus": true,
                            }
                        }, false, true);
                    }
                    return $("#" + id);
                } 

            }
            // window.renderMenu = renderMenu;
            // require(["warehouse"]);
            $('#mainLayout-west').css('backgroundColor', '#b9f09e');
        }

        return viewer;
    });