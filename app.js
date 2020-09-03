//First Module which is the Module Related to Budget Controller Values
//We are using the IIFE format to automatically "run" the function
var budgetController = (function() {

    //function constructor for expenses so we can instatiate many expense objects later
    var Expense = function (id, description, value) {
        this.id= id;
        this.description=description;
        this.value= value;
        //This is the percentage local variable that is equal to -1 zero in the beginning 
        this.percentage= -1;
    };
    
    // We need to add the calculate percentage function to be added to the protoype of the 
    // of expense objects 
    
    Expense.prototype.calcPercentage = function(totaIncome) {
        if (totaIncome > 0) {
            // Calculate the percentage being dividing the value of this item 
            //object by the total income and then multiplying by 100
            this.percentage = Math.round((this.value/totaIncome) * 100);
            
        }
        else {
            this.percentage = -1;
        }
        
        
    };
    
    //This function gets you the percentage of the item. Its good practice to 
    //have one function do one thing 
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    //function constructor for Incomes so we can instatiate many Income objects later
    var Income = function (id, description, value) {
        this.id= id;
        this.description=description;
        this.value= value;
    };
    
    //object that contains all the info on our expenses, incomes, and totals
    var data = {
        allItems : {
            exp : [],
            inc : []
        },

        totals : {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage : -1


    };
    var calculateTotal= function(type) {
        var sum = 0;
        //For each loop executes the function we defined here 
        //which is simply adding to sum variable the value property 
        //of each of the items in the respective list
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;

        });
        data.totals[type] = sum;
    };

    return {
        addItem : function(type,desc, val) {
            var newItem,ID;           

            if (data.allItems[type].length > 0 ) {
                //ID for our new item which is 1 + current length of the array it will be added to
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                //If array is empty then obviously ID would be zero
                ID = 0;
            }            
            
            //So after creating our new item, check its type to see what we should intatiate 
            if (type === 'exp'){
                newItem = new Expense(ID, desc, val);
            }
            else {
                newItem = new Income(ID,desc,val);
            }
            //Now we push our new item into our array
            data.allItems[type].push(newItem);
            
            //Return this item so it can be used in the other modules 
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            //What the map functions is doing is returning an array 
            // same length as data.allitems[type] but in each slot is 
            // id of the item in that slot 
            ids =data.allItems[type].map(function(cur) {
                return cur.id;
            });
            
            //now we use indexof to find the index of where the id we are specifically 
            //searching for because we know it correlates with the item list order
            index= ids.indexOf(id);
            
            //if this index actually exists it would be value other than -1
            if (index !==-1) {
                //the item is spliced or removed from the list 
                data.allItems[type].splice(index,1);
            }
        },
        
        
        //Calculate total income and total expenses 
        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');
            
        //Calculate the budget which is t-income - t- expenses
        data.budget= data.totals.inc - data.totals.exp;

        //And calculate the total percentage of the income we have already spent
        if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
        }
        else {
            data.percentage = -1;
        }
        
        },
        
        //this method calculates the percentages for all the items in the 
        // expense array
        calculatePercentage : function() {
            data.allItems.exp.forEach(function(cur) {
                //Each item calls the calcPercentage method 
                cur.calcPercentage(data.totals.inc);
                
            });
            
            
        },
        
        getPercentages : function() {
            //the map method is going to return array containing all the percentages 
            //of each of the expense
            var allPercs = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
                
            });
            return allPercs;
        },
        //The get budget function is solely to return the budget data values
        //Its a good idea to have one function to do only one thing 
        getBudget : function() {
            //function is going to return an object containing all relevant data
            return {
                budget : data.budget,
                totalinc : data.totals.inc,
                totalexp : data.totals.exp,
                percentage : data.percentage

            };
        },

        testing : function() {
            console.log(data);
        }
    };
}) ();



//UI Module for the display- what the user sees
//These modules are independant of each other 

var UIController = (function() {
    //Code we are going to fill up the IIFE with
    
    //Rather than manually finding classes from the html page all the time 
    //lets just define them as properties of this object
    //these are all the properties of User Interface on the DOM
    var Domstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensLabel : '.budget__expenses--value',
        percentLabl : '.budget__expenses--percentage',
        //this is the main container classes that 
        //exists for the expense or the expense list
        container: '.container',
        dateLabel: '.budget__title--month',
        expensePercLab : '.item__percentage'
        


    }
    
    //this function formats the numbers of the items to a displayable format 
        var formatNumber = function(num, type ) {
            var numsp, int , decimal;
            //Only two decimals places
            //comma after every thousands 
            //+ and - after every number of the item
            //We want the absolute value of the number
            num= Math.abs(num);
            //The tofixed method returns a string representation of the number
            //but also put the amount of decimal places you specifiy 
            num=num.toFixed(2);
            //This will split the num string into a decimal portion and a 
            //integer portion and remember split returns an array of strings
            numsp=num.split('.');
            int = numsp[0];
            if (int.length > 3) {
                //Putting the commas in the case the number is greater than 3 digigts
                int= int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
            }
            decimal=numsp[1];
            //the purpose of this conditional is so that the items have a plus or minus symbol
            //before the value
            if (type === 'exp' ){
                return '-'+int+'.'+decimal;
            }
            else {
                return '+'+int+'.'+decimal;
            }
        };
            
            //Defining the nodelistforeach function over here 
            //that helps you iterate through a node list
            var nodeListForEach = function(list, callback) {
                for(var i = 0; i < list.length; i++) {
                    callback(list[i], i );
                    
                }
            };

    return {
        //Returns an object with all the domstring inputs as properties
        getinput : function() {

            return {
                 type : document.querySelector(Domstrings.inputType).value, // will be either inc or exp
                 description : document.querySelector(Domstrings.inputDescription).value, // description of inc/exp
                 value : parseFloat(document.querySelector(Domstrings.inputValue).value)

            };   
        },
        
        deleteListItem : function(selectorID) {
            //we use the getElement ID function to get the value of the id
            var el = document.getElementById(selectorID);
            
            //we then call the remove child method on the parent of our target elment
            el.parentElement.removeChild(el);
            
        },
        
        addListItem: function (obj, type) {
            var html, newHtml, element;
            
            //Create the HTML String with Place-Holder Text
            if (type === 'inc') {
            element = Domstrings.incomeContainer;
             html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">'+
            '<div class="item__value">%value%</div><div class="item__delete">'+
            '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            

            }
            else if (type === 'exp') {
            element= Domstrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>'+
            '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>'+
            '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>'+
            '</div></div></div>';
            }

            //replace the place holder text with some actual value
            newHtml= html.replace('%id%',obj.id);
            newHtml= newHtml.replace('%description%',obj.description);
            newHtml= newHtml.replace('%value%',formatNumber(obj.value,type));

            //Insert this new HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //We need a method to clear the bar so this is the method design 
        clearFields : function(){
           var fields, fieldsArr;
           //Query SelectorAll returns a list not an array 
           fields= document.querySelectorAll(Domstrings.inputDescription+', '+Domstrings.inputValue);
           //Because fields is a list we need to use call from the Array prototype to use 
           //slice method returns a copy of the array
           fieldsArr= Array.prototype.slice.call(fields);

           //Use the for each loop to clear each slot of the array into 
           //an empty string 
           fieldsArr.forEach(function(current,index,array){
               current.value= '';
           });
           //Brings cursor back to the description bar
           fieldsArr[0].focus();

        },
        
        //Function displays percentages to the UI
        displayPercentages : function(percentages) {
            
            //We use queryselectorall because every expense has its own 
            //percentage class and we need to update every one of them rather 
            // then just one of them 
            var fields = document.querySelectorAll(Domstrings.expensePercLab);
            
            
            
            //Each element of the DOM is called a Node 
            //But we want to access a multitutde of Nodes 
            //so we are using the nodelist
            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                   current.textContent = percentages[index] + '%';
                    
                }else {
                    current.textContent='---';
                }
               
                
                
            });
            
        },
        changeType : function() {
            var fields = document.querySelectorAll(
            Domstrings.inputType +','+
            Domstrings.inputDescription+','+
            Domstrings.inputValue);
            nodeListForEach(fields , function(cur){
                cur.classList.toggle('red-focus')
                
            });
            
            document.querySelector(Domstrings.inputBtn).classList.toggle('red');
        },
        //THis is a function that dis[ays the correct date on the top of the application
        displayDate: function() {
            var now, year;
            now= new Date();
            //year is equal to the correct year because we used the Date objects 
            //getFullyear method
            year=now.getFullYear();
    
            document.querySelector(Domstrings.dateLabel).textContent= year;
            
        },
        //The sole purpose of this budget is to display the top part of the application
        //which is the budget aspect onto the dom
        displayBudget: function(obj) {
            
            var type;
            if (obj.budget < 0) {
                type = 'exp';
            }
            else{
                type='inc';
            }
            
            document.querySelector(Domstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(Domstrings.incomeLabel).textContent=formatNumber(obj.totalinc,'inc');
            document.querySelector(Domstrings.expensLabel).textContent=formatNumber(obj.totalexp,'exp');
            if (obj.percentage > 0) {
                document.querySelector(Domstrings.percentLabl).textContent=obj.percentage+'%';
            }
            else {
                document.querySelector(Domstrings.percentLabl).textContent='---';
            }

        },
        
        //This function returns the object with all the domstrings as properties
        getDomstrings : function () {
            return Domstrings;
        }
    };
    
}) ();



//But we still need to form connection between the seperate modules 
//And that is the purpose of this module 
//This is the global controller 
//We can also pass parameters into modules
var controller = (function(budgtCnt,uiCnt){

    //Function that sets up all the event listeners in one place 
    var setUpEventListeners = function() {
        //This is so now I have the object with all the Domstring properties
        var Dom = uiCnt.getDomstrings();
        
        //Putting an event handler in the event that the check button is 
        //clicked which means a new item has been created 
        //uses the ctrlAddItem function
        document.querySelector(Dom.inputBtn).addEventListener('click', ctrlAddItem);
        
        //Setting up event listener in the case that you are inputting in 
        //an expense and then the outline of the boxes will be red instead
        //of blue
        document.querySelector(Dom.inputType).addEventListener('change',uiCnt.changeType);
        
        //And an item is also created in the event the "enter" 
        //key is clicked. 
        //
        document.addEventListener('keypress',function(event){
            if (event.keyCode === 13|| event.which === 13) {
               ctrlAddItem();
            }
    
        });
        //If the x is clicked in the DOM, then an item is deleted 
        document.querySelector(Dom.container).addEventListener('click',ctrlDeleteItem);

    };
    
    var upDatePercentages = function(){
        //Calculate the new percentages
        budgtCnt.calculatePercentage();
        
        //Read the percentages from budget controller 
        
        var percentages = budgtCnt.getPercentages();
        
        //Update the percentages on the UI
        uiCnt.displayPercentages(percentages);
    };

    var upDateBudget= function(){
        //Calculate the budget 
        budgtCnt.calculateBudget();
        

        //return the budget    
        var budget = budgtCnt.getBudget();

        //Display the budget the on the UI
        uiCnt.displayBudget(budget);
        
        

    };
    
    var ctrlAddItem= function () {
        var input, newItem;
        //Get field input data

         input = uiCnt.getinput();
         //Troubleshooting in the case that a description isn't entered 
         //or if the value isn't a number and it is expected that the value
         //is greater than 0
         if (input.description !== '' && !isNaN(input.value) && (input.value > 0) ) {
              //Add the item to the budget controller 
               newItem = budgtCnt.addItem(input.type,input.description,input.value);
        
               //Add the item to the UI
               uiCnt.addListItem(newItem,input.type);

               //Clear the fields
               uiCnt.clearFields();
        
                //Calculate and update the budget using the updatebudget function
                upDateBudget();
             
                //We need to update the percentages everysingle time a new item is added 
                upDatePercentages();
             
             
         }
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        //The purporse of this is to traverse through the dom until we reach the first 
        // class/ div the target element is in so that we delete that entire structure
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        //The only ID in the entire HTML document are the expense or income items 
        //thus only when those values are in the itemID, is itemID a defined variable 
        //which means its true 
        if (itemID) {
            
            //itemID is the string that has the type and item id next to it 
            // ex. exp-0 exp is the type value while 0 is the id 
            splitID=itemID.split("-");
            
            type = splitID[0];
           
            //We have to parseInt this because split returns an 
            //array of strings
            ID = parseInt(splitID[1]);
            
            //We first have to remove the item we are targetting from our data structure 
            budgtCnt.deleteItem(type, ID);
            
            //We then have to remove the item from the user interface 
            uiCnt.deleteListItem(itemID);
            
            
            //We then update and show the new budget after the item is completely removed 
            upDateBudget();
            
            //We need to update the percentages every single time an item has been deleted
            upDatePercentages();
            
        }
        
    };

    return {
        //This is the initialization function that sets-up many things such as the event listeners
        init : function() {
            uiCnt.displayDate();
            //When the application begins, the budget is displayed but with everything zero-ed out 
            uiCnt.displayBudget({
                budget : 0,
                totalinc : 0,
                totalexp : 0,
                percentage : -1
            });
            setUpEventListeners();
            
            
        }
    };

   
   
    
    
    

}) (budgetController,UIController);

//Only line of code outside of the modules. THis basically initalizes our application
controller.init();




                    

