window.simulateTyping = async (selector, text) => {
    const el = document.querySelector(selector);
    if (!el) {
        console.warn("Elemento no encontrado:", selector);
        return;
    }

    function dispatch(target, eventName, options) {
        const isInputEvent = eventName === "input";
        const event = new (isInputEvent ? InputEvent : KeyboardEvent)(
            eventName,
            Object.assign(
                { bubbles: true, cancelable: true },
                options
            )
        );
        target.dispatchEvent(event);
    }

    // -------------------------
    // LIMPIAR EL CAMPO (con eventos reales)
    // -------------------------
    if (el.value && el.value.length > 0) {
        const oldValue = el.value;
        el.value = ""; // limpiar
        dispatch(el, "input", {
            data: null,
            inputType: "deleteContentBackward",
        });
        dispatch(el, "change", {});
        console.log("Campo limpiado:", oldValue);
    }

    // -------------------------
    // ESCRIBIR TEXTO NUEVO
    // -------------------------
    for (const char of text) {
        dispatch(el, "keydown", { key: char });

        el.value += char; // agregar texto real

        dispatch(el, "input", {
            data: char,
            inputType: "insertText",
        });

        dispatch(el, "keyup", { key: char });
    }
}

window.getIcon = async (iconName)=>{
    await window.simulateTyping("#mat-input-0", iconName);
    await new Promise(r=>setTimeout(r, 600))
    document.querySelector('button[icon-item][aria-label]').click()
    await new Promise(r=>setTimeout(r, 600))
    document.querySelector('button[aria-label="Download asset in SVG format for this icon"]').click();
}

window.searchIcon = async (iconName="")=>{
    if (iconName.length>0) {
        await window.simulateTyping("#mat-input-0", iconName);
        await new Promise(r=>setTimeout(r, 400))
    }
    const results = []
    document.querySelectorAll('button[icon-item][aria-label]').forEach(element => {
        results.push(element.querySelector('span.icon-name').textContent)
    });
    return results;
}
