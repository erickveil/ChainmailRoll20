var styletest = {
    start : "<h1>",
    end : "</h1>"
};

on("chat:message", function(msg) {
    if (msg.type === "api" && msg.content.indexOf("!test") !== -1) {
        var greenText = "background-color: green; color: yellow; margin: 5px; padding: 5px;"
        sendChat(msg.who, "<hr style='color=black;'/>"
            + "<H1 style='color:blue;' >Hello World.</H1>"
            + "<h2 style='background-color: blue; color: maroon;'>"
            + "Line Red</h2>"
            + "<p style='" + greenText + "'>Paragraph starts here. We do some rolls, then we format, and then we see how this stuff wraps."
            + "</p>"
        );
        sendChat(msg.who, styletest.start + "Standard text block from css." + styletest.end);
    }
});