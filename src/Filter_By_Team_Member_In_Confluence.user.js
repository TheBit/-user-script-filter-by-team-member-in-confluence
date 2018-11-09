// ==UserScript==
// @name         Filter By Team Member
// @namespace    https://github.com/TheBit/user-script-filter-by-team-member-in-confluence
// @version      0.1
// @description  Adds custom filtering possibilities to Confluence (select team member to see only his/her task cards)
// @author       TheBit
// @copyright    2018, TheBit
// @license MIT
// @match        https://confluence.betlab.com/pages/*
// @match        https://confluence.betlab.com/display/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);

    const selectors = {
        allPicker: `[data-all-picker='']`,
        picker: `[data-macro-name='profile-picture']`,
        memberPicker: (member) => `[data-macro-name='profile-picture'][data-username='${member}']`,
        memberInTask: (member) => `[data-macro-name='panel'] [data-macro-name='profile-picture'][data-username='${member}']`,
        taskContainer: `[data-macro-name='panel']`,
    };

    const teamContainer = $(selectors.picker).parentNode;
    const team = [...teamContainer.children].
                 filter( member => member.dataset.username ).
                 map( member => member.dataset.username );

    const selectedMembers = [];

    const handlers = {
        onAllPickerClick: (event, picker) => {
            event.preventDefault();

            highlight(picker);

            selectedMembers.forEach( member => unhighlight($(selectors.memberPicker(member))) );
            selectedMembers.length = 0;

            $$(selectors.taskContainer).forEach( taskContainer => show(taskContainer) );
        },

        onMemberPickerClick: (event, member) => {
            event.preventDefault();

            unhighlight($(selectors.allPicker));

            //Toggle selected member
            if (selectedMembers.includes(member)) {
                selectedMembers.splice( selectedMembers.indexOf(member), 1); //unselect already selected
                unhighlight($(selectors.memberPicker(member)));
            } else {
                selectedMembers.push(member); //select new one
                highlight($(selectors.memberPicker(member)));
            }

            //Hide all tasks
            $$(selectors.taskContainer).forEach( taskContainer => hide(taskContainer) );

            //Show only those tasks which corresponds to selected members
            selectedMembers.forEach( member => {
                let memberInTasks = $$(selectors.memberInTask(member));
                memberInTasks.forEach( memberInTask => show(memberInTask.closest(selectors.taskContainer)) );
            } );
        },
    }

    //Let all member pickers become clickable
    team.forEach( member => {
        let memberPicker = $(selectors.memberPicker(member));
        memberPicker.addEventListener('click', (event) => handlers.onMemberPickerClick(event, member));
    } );

    //Clones first member picker and transforms it to "All" picker
    (function createAllPicker() {
        let firstPicker = $(selectors.picker);
        let clone = firstPicker.cloneNode(true);
        clone.firstChild.src = 'https://image.ibb.co/bDXPnq/ALL.png';
        clone.removeAttribute('data-username');
        clone.setAttribute('data-all-picker', '');
        highlight(clone);

        clone.addEventListener('click', (event) => handlers.onAllPickerClick(event, clone));

        firstPicker.parentNode.insertBefore(clone, firstPicker);
    })();

    //DOM utils:
    function highlight(element) {
        element.firstChild.style.boxShadow = '0px 0px 15px red';
    }

    function unhighlight(element) {
        element.firstChild.style.boxShadow = '';
    }

    function show(element) {
        element.style.display = 'block';
    }

    function hide(element) {
        element.style.display = 'none';
    }
})();