import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})

const preventFormSubmit = (form : HTMLFormElement) => form.addEventListener('submit', e => e.preventDefault())

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should post form on ENTER press if only containing one text field', async t => {
    document.body.innerHTML = '<form id="formWithOneInput" method="post"><input id="txt" type="text"></form>'

    const formWithOneInput  = t.$('#formWithOneInput') as HTMLFormElement
    preventFormSubmit(formWithOneInput)

    t.firesOnce(formWithOneInput, 'submit', 'Expect a form to be posted on ENTER press if only containing one text field')

    await t.type('#txt', 'A[ENTER]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should NOT post form on ENTER press if form contains more than one text field', async t => {
    document.body.innerHTML =
        '<form id="formWithTwoInputs" method="post">' +
            '<input id="txt2" type="text">' +
            '<input id="txt3" type="text">' +
        '</form>'

    const formWithTwoInputs = t.$('#formWithTwoInputs') as HTMLFormElement
    preventFormSubmit(formWithTwoInputs)

    t.wontFire(formWithTwoInputs, 'submit', 'Expect a form not to be posted on ENTER press if containing more than 1 field')

    await t.type('#txt2', 'A[ENTER]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should submit a form on ENTER, if form is containing a submit input', async t => {
    document.body.innerHTML =
        '<form id="formWithSubmit" method="post">' +
            '<input id="txt4" type="text">' +
            '<input id="txt5" type="text">' +
            '<input type="submit" value="Submit">' +
        '</form>'

    const formWithSubmit = t.$('#formWithSubmit') as HTMLFormElement
    preventFormSubmit(formWithSubmit)

    t.firesOnce(formWithSubmit, 'submit')

    await t.type('#txt4', 'A[ENTER]')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should NOT post form on ENTER press if keypress event is prevented', async t => {
    document.body.innerHTML =
        '<form id="formPrevented" method="post">' +
            '<input id="txt6" type="text">' +
            '<input type="submit" value="Submit">' +
        '</form>'

    const formPrevented = t.$('#formPrevented') as HTMLFormElement
    preventFormSubmit(formPrevented)

    t.$('#txt6').addEventListener('keypress', (event : KeyboardEvent) => {
        if (event.key === 'Enter') event.preventDefault()
    })

    t.wontFire(formPrevented, 'submit', 'Expect a form NOT to be posted on ENTER press if event is prevented')

    await t.type('#txt6', 'A[ENTER]')
})

