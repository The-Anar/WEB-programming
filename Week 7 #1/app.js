const root=document.documentElement;
const savedTheme=localStorage.getItem("anar-book-theme");
if(savedTheme)root.dataset.theme=savedTheme;
document.querySelectorAll("[data-theme-toggle]").forEach(button=>button.addEventListener("click",()=>{
 const next=root.dataset.theme==="light"?"dark":"light";root.dataset.theme=next;localStorage.setItem("anar-book-theme",next);
}));
const form=document.querySelector("#search-form"),input=document.querySelector("#book-query"),results=document.querySelector("#book-results"),status=document.querySelector("#search-status"),loadMore=document.querySelector("#load-more");
let currentQuery="",currentPage=1,busy=false;
function escapeHtml(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function bookCard(book){const title=book.title||"Untitled book",author=book.author_name?.[0]||"Author unknown",year=book.first_publish_year||"Year unknown",cover=book.cover_i?`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`:"",url=book.key?`https://openlibrary.org${book.key}`:"https://openlibrary.org";
return `<article class="book"><div class="cover">${cover?`<img loading="lazy" src="${cover}" alt="Cover of ${escapeHtml(title)}" onerror="this.remove();this.parentElement.textContent='📚';">`:"📚"}</div><div class="book-info"><h3>${escapeHtml(title)}</h3><p>by ${escapeHtml(author)}</p><p>First published: ${escapeHtml(year)}</p><a href="${url}" target="_blank" rel="noopener noreferrer">View on Open Library ↗</a></div></article>`;}
async function searchBooks(query,page=1){if(busy)return;busy=true;status.textContent=page===1?"Searching Open Library…":"Loading more books…";if(loadMore)loadMore.disabled=true;if(page===1)results.innerHTML="";
try{const params=new URLSearchParams({q:query,page:String(page),limit:"12",fields:"key,title,author_name,first_publish_year,cover_i"});const response=await fetch(`https://openlibrary.org/search.json?${params}`);if(!response.ok)throw new Error("Request failed");const data=await response.json(),books=data.docs||[];
if(page===1&&!books.length)status.textContent=`No books found for “${query}”. Try another search.`;else{results.insertAdjacentHTML("beforeend",books.map(bookCard).join(""));const count=Number(data.numFound||data.num_found||0);status.textContent=`Showing ${results.children.length} results · ${count.toLocaleString()} matching records`;}
currentPage=page;if(loadMore)loadMore.classList.toggle("hidden",books.length<12);
}catch(error){status.textContent="Couldn't load books. Check your connection and try again.";if(page===1)results.innerHTML='<div class="notice">The request failed. Check your connection and retry.</div>';}
finally{busy=false;if(loadMore)loadMore.disabled=false;}}
if(form&&input&&results&&status){form.addEventListener("submit",event=>{event.preventDefault();const query=input.value.trim();if(!query){status.textContent="Type a book title or author first.";input.focus();return;}currentQuery=query;currentPage=1;searchBooks(query,1);});if(loadMore)loadMore.addEventListener("click",()=>{if(currentQuery)searchBooks(currentQuery,currentPage+1);});}
