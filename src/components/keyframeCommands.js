export default (editor) => {
    editor.Commands.add('add-animation', {
      run(editor, sender, { animationName, css }) {
        const cssComposer = editor.CssComposer;
        cssComposer.addRules(css);
        editor.UndoManager.add({
          undo() {
            const styles = cssComposer.getAll();
            styles.each((style) => {
              if (style.get("selectors") && style.get("selectors").findWhere({ name: animationName })) {
                cssComposer.getAll().remove(style);
              }
            });
          },
          redo() {
            cssComposer.addRules(css);
          },
        });
      },
    });
  
    editor.Commands.add('update-animation', {
      run(editor, sender, { animationName, css }) {
        const cssComposer = editor.CssComposer;
        const styles = cssComposer.getAll();
        let existingStyle;
  
        styles.each((style) => {
          if (style.get("selectors") && style.get("selectors").findWhere({ name: animationName })) {
            existingStyle = style;
          }
        });
  
        if (existingStyle) {
          const oldCss = existingStyle.toCSS();
          cssComposer.addRules(css);
          editor.UndoManager.add({
            undo() {
              cssComposer.addRules(oldCss);
            },
            redo() {
              cssComposer.addRules(css);
            },
          });
        } else {
          cssComposer.addRules(css);
          editor.UndoManager.add({
            undo() {
              cssComposer.getAll().remove(css);
            },
            redo() {
              cssComposer.addRules(css);
            },
          });
        }
      },
    });
  
    editor.Commands.add('remove-animation', {
      run(editor, sender, animationName) {
        const cssComposer = editor.CssComposer;
        const styles = cssComposer.getAll();
        let existingStyle;
  
        styles.each((style) => {
          const cssText = style.toCSS();
          const regex = new RegExp(`@keyframes\\s+${animationName}\\s*{([\\s\\S]*?)}`, 'g');
          if (regex.test(cssText)) {
            existingStyle = style;
          }
        });
  
        if (existingStyle) {
          const oldCss = existingStyle.toCSS();
          cssComposer.getAll().remove(existingStyle);
          editor.UndoManager.add({
            undo() {
              cssComposer.addRules(oldCss);
            },
            redo() {
              cssComposer.getAll().remove(existingStyle);
            },
          });
        }
      },
    });
  };
  