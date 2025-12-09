var toggle = new Array();
var toggle_2 = 1;
var val = 600;
var ScrollList;
document.addEventListener("DOMContentLoaded", () => {

	ScrollList = document.querySelectorAll('div.ScrollContainer');
	let i = 0;
	ScrollList.forEach((scroll_item) => {
		toggle[i++] = 1;
	})

	setInterval(UserBarScrolling, 5000);
	setInterval(contentScrolling, 10000);
	setInterval(LocalTime, 1000);

	function LocalTime()
	{
		const date = new Date();
		document.getElementById("demo").innerHTML = date.toLocaleTimeString();
	}

	function UserBarScrolling()
	{
		let i = 0;
		ScrollList.forEach((Scroll) => {
			//console.log(Scroll.scrollTop + " | " + Scroll.scrollHeight + " | " +Scroll.clientHeight);
			if (toggle[i] == 1)
			{
				if(Scroll.scrollTop == (Scroll.scrollHeight - Scroll.clientHeight))
				{
					toggle[i] = -1;
				}
				Scroll.scrollBy({
					top: val,
					left: 0,
					behavior: 'smooth'
				});
			}
			if (toggle[i] == -1)
			{
				if(Scroll.scrollTop == 0)
				{
					toggle[i] = 1;

				}
				Scroll.scrollBy({
					top: -val,
					left: 0,
					behavior: 'smooth'
				});
			}
			i++;
		})
	}

	function contentScrolling()
	{
		let Scroll = document.getElementById('UserBar');
		if (toggle_2 == 1)
		{
			if (Scroll.scrollLeft == (Scroll.scrollWidth - Scroll.clientWidth))
			{
				toggle_2 = -1;
			}
			Scroll.scrollBy({
				top: 0,
				left: val,
				behavior: 'smooth'
			});
		}
		if (toggle_2 == -1)
		{
			if (Scroll.scrollLeft == 0)
			{
				toggle_2 = 1;
			}
			Scroll.scrollBy({
				top: 0,
				left: -val,
				behavior: 'smooth'
			});
		}

	}
});

